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
    // @ts-expect-error isVerified is custom
    if (!session.user.isVerified) {
      return NextResponse.json({ error: "Student verification required" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, description, category, payment, isNegotiable, address, longitude, latitude, expiresAt, image } = body;

    if (!longitude || !latitude) {
      return NextResponse.json({ error: "Location is required to post a gig" }, { status: 400 });
    }
    if (!expiresAt) {
      return NextResponse.json({ error: "Expiry date is required" }, { status: 400 });
    }

    const maxExpiry = new Date();
    maxExpiry.setDate(maxExpiry.getDate() + 7);
    const providedExpiry = new Date(expiresAt);
    if (providedExpiry > maxExpiry) {
      return NextResponse.json({ error: "Gig cannot last more than 1 week" }, { status: 400 });
    }

    const gig = await Gig.create({
      title,
      description,
      category,
      payment,
      isNegotiable,
      image: image || null,
      address,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      },
      expiresAt: providedExpiry,
      // @ts-expect-error session.user lacks id
      postedBy: session.user.id
    });

    return NextResponse.json(gig, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create gig" }, { status: 500 });
  }
}
