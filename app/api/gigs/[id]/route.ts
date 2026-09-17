import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import "@/models/User"; // Ensure User is registered for population

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const gig = await Gig.findById(params.id).populate('postedBy', 'name avgRating');
    
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    
    // Fetch the application if it exists
    const application = await Application.findOne({ gigId: gig._id }).populate('workerId', 'name');
    
    // We can merge them or send in one object
    return NextResponse.json({ ...gig.toObject(), application });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch gig details" }, { status: 500 });
  }
}
