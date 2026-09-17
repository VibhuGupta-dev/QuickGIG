import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Application from "@/models/Application";
import Gig from "@/models/Gig";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { applicationId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { applicationId } = params;
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;

    // Verify user is either the worker or the gig poster
    const application = await Application.findById(applicationId).populate('gigId');
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const gig = application.gigId;
    if (application.workerId.toString() !== userId && gig.postedBy.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    const messages = await Message.find({ applicationId }).sort({ createdAt: 1 });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { applicationId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { applicationId } = params;
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;
    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    // Verify user is either the worker or the gig poster
    const application = await Application.findById(applicationId).populate('gigId');
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const gig = application.gigId;
    if (application.workerId.toString() !== userId && gig.postedBy.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    const message = await Message.create({
      applicationId,
      senderId: userId,
      text: text.trim()
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
