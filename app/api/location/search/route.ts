import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length < 2) {
      return NextResponse.json([]);
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&limit=6&addressdetails=1&accept-language=en`,
      {
        headers: {
          "User-Agent": "QuickGigsApp/1.0 (student-project@quickgigs.local)",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
