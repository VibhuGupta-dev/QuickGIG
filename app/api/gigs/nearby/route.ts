import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const lat = searchParams.get('lat');
    const radius = searchParams.get('radius') || "10"; // default 10km

    if (!lng || !lat) {
      return NextResponse.json({ error: "Longitude and latitude are required" }, { status: 400 });
    }

    await dbConnect();

    const maxDistance = Number(radius) * 1000; // Convert km to meters for $near

    const gigs = await Gig.find({
      status: 'Open',
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: maxDistance
        }
      }
    }).populate('postedBy', 'name avgRating').limit(50);

    return NextResponse.json(gigs);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch nearby gigs" }, { status: 500 });
  }
}
