// GET /api/chat
// Returns array of: { gigId, gigTitle, gigStatus, otherUser: {id, name}, lastMessage: {content, createdAt, isRead, isMine}, unreadCount }
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Gig from "@/models/Gig";
import "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // @ts-expect-error session.user lacks id
  const userId = session.user.id;
  await dbConnect();

  // Get all unique gigIds where user sent or received a message
  const gigIds = await Message.distinct('gigId', {
    $or: [{ senderId: userId }, { receiverId: userId }]
  });

  const conversations = await Promise.all(gigIds.map(async (gigId: mongoose.Types.ObjectId) => {
    const gig = await Gig.findById(gigId).populate('postedBy', 'name').lean();
    if (!gig) return null;

    const lastMsg = await Message.findOne({ gigId })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .lean();

    const unreadCount = await Message.countDocuments({
      gigId,
      receiverId: userId,
      isRead: false
    });

    // Determine other user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gigAny = gig as any;
    const posterIdStr = gigAny.postedBy?._id?.toString() || gigAny.postedBy?.toString();
    const isIPoster = posterIdStr === userId;

    // Find the other user from last message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastMsgAny = lastMsg as any;
    const otherUserId = isIPoster
      ? lastMsgAny?.receiverId?._id?.toString() || lastMsgAny?.receiverId?.toString()
      : posterIdStr;
    const otherUserName = isIPoster
      ? lastMsgAny?.receiverId?.name
      : gigAny.postedBy?.name;

    return {
      gigId: gigId.toString(),
      gigTitle: gigAny.title,
      gigStatus: gigAny.status,
      otherUser: { id: otherUserId, name: otherUserName || 'Unknown' },
      lastMessage: lastMsg ? {
        content: lastMsgAny.content,
        createdAt: lastMsgAny.createdAt,
        isRead: lastMsgAny.isRead,
        isMine: lastMsgAny.senderId?._id?.toString() === userId || lastMsgAny.senderId?.toString() === userId
      } : null,
      unreadCount
    };
  }));

  return NextResponse.json(conversations.filter(Boolean));
}
