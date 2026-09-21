import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { studentId } = await req.json();

    if (!studentId || studentId.length < 4) {
      return NextResponse.json({ error: "Invalid Student ID" }, { status: 400 });
    }

    const isDevMode = process.env.NODE_ENV === "development";
    let age = 20;
    let sessionStr = "2022-2026";

    if (isDevMode) {
      console.log("Dev Mode active: Bypassing AI verification for student ID");
      // Fallback for development mode
      age = 21;
      sessionStr = "2021-2025";
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

      const currentYear = new Date().getFullYear();

      const prompt = `
        You are an expert at parsing Indian college/university student IDs or roll numbers (e.g. 21BCS012, 1902030, 2021XX).
        The student ID is: "${studentId}".
        The current year is ${currentYear}.
        
        Tasks:
        1. Extract the likely enrollment year (e.g. "21" in "21BCS012" means 2021). If you can't figure it out, fallback to 2022.
        2. Calculate the student's current age assuming they enrolled at age 18. Age = 18 + (Current Year - Enrollment Year).
        3. Create a session string, which is typically EnrollmentYear to EnrollmentYear+4 (e.g., "2021-2025").

        Return ONLY a valid JSON object in exactly this format with no backticks, no code blocks, and no extra text:
        {"enrollmentYear": 2021, "age": 21, "sessionStr": "2021-2025"}
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      
      // Clean up potential markdown formatting
      if (text.startsWith("\`\`\`json")) {
        text = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      } else if (text.startsWith("\`\`\`")) {
        text = text.replace(/\`\`\`/g, "").trim();
      }

      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse AI output:", text);
        return NextResponse.json({ error: "AI failed to verify the Student ID format." }, { status: 400 });
      }

      age = parsedData.age;
      sessionStr = parsedData.sessionStr;
    }

    // Validation rule: age must be < 25
    if (age >= 25) {
      return NextResponse.json({ error: "Verification Failed: Age is 25 or above. Only students under 25 are eligible." }, { status: 400 });
    }

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
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify student" }, { status: 500 });
  }
}
