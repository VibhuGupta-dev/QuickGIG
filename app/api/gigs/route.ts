import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import User from "@/models/User";
import Notification from "@/models/Notification";
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

    try {
      const nearbyUsers = await User.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: 10000 // 10km radius
          }
        },
        // @ts-expect-error session.user lacks id
        _id: { $ne: session.user.id }
      });

      const notifications = nearbyUsers.map(user => ({
        userId: user._id,
        type: 'NEW_GIG',
        content: `A new gig "${title}" is available near you!`,
        link: `/dashboard/gig/${gig._id}`
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (err) {
      console.error("Failed to send nearby notifications", err);
    }

    return NextResponse.json(gig, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create gig" }, { status: 500 });
  }
}
