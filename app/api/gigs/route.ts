import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const gigs = await Gig.find({}).sort({ createdAt: -1 });
    return NextResponse.json(gigs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gigs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, description, category, payment } = body;

    const gig = await Gig.create({
      title,
      description,
      category,
      payment,
      // @ts-expect-error session.user type lacks id
      postedBy: session.user.id
    });

    return NextResponse.json(gig, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create gig" }, { status: 500 });
  }
}
