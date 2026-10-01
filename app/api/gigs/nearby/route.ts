import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const lat = searchParams.get('lat');
    const radius = searchParams.get('radius') || "10"; // default 10km
    const q = searchParams.get('q');
    const category = searchParams.get('category');

    if (!lng || !lat) {
      return NextResponse.json([]);
    }

    await dbConnect();
    // Ensure User model is loaded for population
    const _ = User;

    const maxDistance = Number(radius) * 1000; // Convert km to meters for $near

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      status: 'Open',
      expiresAt: { $gte: new Date() },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: maxDistance
        }
      }
    };

    if (category && category !== "All") {
      query.category = category;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gigs: any[] = [];
    try {
      gigs = await Gig.find(query).populate('postedBy', 'name avgRating').limit(50);
    } catch {
      // Fallback if 2dsphere index is building or geospatial query encounters an issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fallbackQuery: any = { 
        status: 'Open',
        expiresAt: { $gte: new Date() }
      };
      if (category && category !== "All") fallbackQuery.category = category;
      if (q) {
        fallbackQuery.$or = [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ];
      }
      gigs = await Gig.find(fallbackQuery).populate('postedBy', 'name avgRating').sort({ createdAt: -1 }).limit(50);
    }

    return NextResponse.json(gigs);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Error in nearby gigs API:", err);
    return NextResponse.json([]);
  }
}
