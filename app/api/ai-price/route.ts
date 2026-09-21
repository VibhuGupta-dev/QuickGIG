import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { title, description, category } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Missing gig details" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured in .env.local" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `
      You are an expert on the local gig economy and part-time labor rates in India.
      A user wants to post a short-term local gig with the following details:
      - Category: ${category}
      - Title: ${title}
      - Description: ${description}

      Task: Estimate a fair market price (in INR ₹) for this specific gig. 
      Important Rules:
      1. ONLY return the numeric integer value. Do not return text, currency symbols, or ranges. 
      2. If it's a very small task (e.g., small errand), keep it realistic (e.g., 100-300). 
      3. If it requires more time or effort, suggest higher (e.g., 500-1500).
      Return ONLY a single number.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Extract numbers just in case the AI added extra text despite instructions
    const priceStr = text.replace(/[^0-9]/g, '');
    const price = parseInt(priceStr, 10);

    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "AI could not determine a valid price." }, { status: 400 });
    }

    return NextResponse.json({ price });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to estimate price" }, { status: 500 });
  }
}
