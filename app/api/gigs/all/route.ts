import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    
    // Ensure User model is loaded for population
    const _ = User;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { status: "Open" };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    // Fetch all open gigs
    const gigs = await Gig.find(query)
      .populate("postedBy", "name email avgRating")
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50 gigs to avoid payload too large

    return NextResponse.json(gigs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch all gigs" }, { status: 500 });
  }
}
