import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import "@/models/User"; // Ensure User is registered for population

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const gig = await Gig.findById(params.id).populate('postedBy', 'name avgRating');
    
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    
    return NextResponse.json(gig);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gig details" }, { status: 500 });
  }
}
