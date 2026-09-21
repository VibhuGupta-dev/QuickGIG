import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Application from "@/models/Application";
import Gig from "@/models/Gig";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // @ts-expect-error isVerified is custom
    if (!session.user.isVerified) {
      return NextResponse.json({ error: "Student verification required to take gigs" }, { status: 403 });
    }

    await dbConnect();
    const { gigId, proposedPrice } = await req.json();
    // @ts-expect-error session.user lacks id
    const workerId = session.user.id;

    // Check if gig is still Open
    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'Open') {
      return NextResponse.json({ error: "Gig is no longer available" }, { status: 400 });
    }

    // Check if already applied
    const existing = await Application.findOne({ gigId, workerId });
    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    // Create Application & change Gig status to Accepted
    const application = await Application.create({ gigId, workerId, proposedPrice, status: 'Accepted' });
    gig.status = 'Accepted';
    await gig.save();

    return NextResponse.json({ message: "Gig accepted successfully", application }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to accept gig" }, { status: 500 });
  }
}

export async function GET() {
  // Get all applications for current user (as worker)
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    // @ts-expect-error session.user lacks id
    const workerId = session.user.id;

    const apps = await Application.find({ workerId }).populate('gigId').sort({ appliedAt: -1 });
    return NextResponse.json(apps);
  } catch {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
