import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import Message from "@/models/Message";
import Application from "@/models/Application";

export async function POST() {
  await dbConnect();
  const now = new Date();

  // Delete expired gigs (deadline passed AND status is Open/Accepted/In-Progress)
  const expiredGigs = await Gig.find({
    expiresAt: { $lt: now },
    status: { $in: ['Open', 'Accepted', 'In-Progress'] }
  });

  // Delete completed gigs (status Completed)
  const completedGigs = await Gig.find({ status: 'Completed' });

  const toDelete = [...expiredGigs, ...completedGigs];
  const gigIds = toDelete.map(g => g._id);

  if (gigIds.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  // Clean up related data
  await Message.deleteMany({ gigId: { $in: gigIds } });
  await Application.deleteMany({ gigId: { $in: gigIds } });
  await Gig.deleteMany({ _id: { $in: gigIds } });

  return NextResponse.json({ deleted: gigIds.length });
}
