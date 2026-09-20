import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { gigId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;

    await dbConnect();

    const messages = await Message.find({
      gigId: params.gigId,
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { gigId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;

    await dbConnect();
    const { content, receiverId } = await req.json();

    if (!content || !receiverId) {
      return NextResponse.json({ error: "Content and receiverId are required" }, { status: 400 });
    }

    const message = await Message.create({
      gigId: params.gigId,
      senderId: userId,
      receiverId,
      content,
      isRead: false
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}
