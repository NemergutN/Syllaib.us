import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
});

export async function POST(req: NextRequest) {
  try {
    const { courses } = await req.json() as { courses: string[] };

    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Based on a student taking these courses: ${courses.join(", ")}, suggest 5 personalized job or internship roles they should pursue. Return ONLY a JSON array of objects like:
[{ "title": "string", "reason": "string", "skills": ["string"] }]
Keep each reason to one sentence. List 2-3 relevant skills per role.`,
        }],
      }],
    });

    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);
    return NextResponse.json({ recommendations: data });
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
