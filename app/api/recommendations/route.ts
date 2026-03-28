import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { courses } = await req.json() as { courses: string[] };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on a student taking these courses: ${courses.join(", ")}, suggest 5 personalized job or internship roles they should pursue. Return ONLY a JSON array of objects like:
[{ "title": "string", "reason": "string", "skills": ["string"] }]
Keep each reason to one sentence. List 2-3 relevant skills per role.`,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text!);
    return NextResponse.json({ recommendations: data });
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
