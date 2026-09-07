import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password, phone, longitude, latitude } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userData: any = { name, email, password: hashedPassword, phone };
    if (longitude !== undefined && latitude !== undefined) {
      userData.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      };
    }

    const user = await User.create(userData);

    return NextResponse.json({ message: "User registered", user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
