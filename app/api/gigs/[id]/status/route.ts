import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gig from "@/models/Gig";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { status } = await req.json(); // e.g., 'In-Progress', 'Completed'
    
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;

    const gig = await Gig.findById(params.id);
    if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

    // Ensure only the poster can update status? Or both?
    // Let's restrict to poster for simplicity.
    if (gig.postedBy.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized to update this gig" }, { status: 403 });
    }

    const validStatuses = ['Open', 'Accepted', 'In-Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    gig.status = status;
    await gig.save();

    return NextResponse.json({ message: "Status updated", gig });
  } catch {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
