import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import Application from "@/models/Application";
import "@/models/User";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const gig = await Gig.findById(params.id).populate('postedBy', 'name avgRating').lean();
    
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    
    let application = null;
    if (gig.status !== 'Open') {
      application = await Application.findOne({ gigId: gig._id, status: 'Accepted' }).populate('workerId', 'name').lean();
    }
    
    return NextResponse.json({ ...gig, application });
  } catch {
    return NextResponse.json({ error: "Failed to fetch gig details" }, { status: 500 });
  }
}
