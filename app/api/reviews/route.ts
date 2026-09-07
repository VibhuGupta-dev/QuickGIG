import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { gigId, reviewedUserId, rating, comment } = await req.json();
    // @ts-expect-error session.user lacks id
    const reviewerId = session.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const review = await Review.create({ gigId, reviewerId, reviewedUserId, rating, comment });

    // Update user average rating
    const allReviews = await Review.find({ reviewedUserId });
    const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(reviewedUserId, { avgRating: avg });

    return NextResponse.json({ message: "Review submitted successfully", review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
