import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
