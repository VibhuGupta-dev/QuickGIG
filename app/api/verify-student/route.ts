import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { studentId } = await req.json();

    if (!studentId || studentId.length < 4) {
      return NextResponse.json({ error: "Invalid Student ID" }, { status: 400 });
    }

    // Generic Mock Parser: 
    // Assuming format starts with 2 digits for year (e.g. 21BCS012 -> 2021)
    const yearStr = studentId.substring(0, 2);
    let enrollmentYear = parseInt(yearStr, 10);
    
    if (isNaN(enrollmentYear)) {
      // Fallback
      enrollmentYear = 22; 
    }
    
    // Adjust century (assume 2000s)
    enrollmentYear += 2000;
    
    const currentYear = new Date().getFullYear();
    
    // Assuming age at enrollment is 18
    const age = 18 + (currentYear - enrollmentYear);
    const sessionStr = `${enrollmentYear}-${enrollmentYear + 4}`;

    // Verify rules: age must be at least 18 (which it is, since min year is 2000s)
    
    // @ts-expect-error session.user lacks id
    const userId = session.user.id;

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.studentId = studentId;
    user.age = age;
    user.session = sessionStr;
    user.isVerified = true;
    
    await user.save();

    return NextResponse.json({ message: "Verification successful", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify student" }, { status: 500 });
  }
}
