import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;

    const gigs = await Gig.find({ postedBy: userId }).sort({ createdAt: -1 });
    return NextResponse.json(gigs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gigs" }, { status: 500 });
  }
}
