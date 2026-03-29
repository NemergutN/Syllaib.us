import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
});

export async function POST(req: NextRequest) {
  try {
    const { courses } = (await req.json()) as { courses: string[] };

    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `A student is taking these courses: ${courses.join(", ")}.
Suggest 5 real, relevant job or internship listings they should apply to.
For each, provide a real company name, a realistic job title, a real careers page URL (e.g. https://careers.google.com), and a location.
Return ONLY a JSON array in this exact format:
[{ "company": "string", "title": "string", "url": "string", "location": "string" }]`,
        }],
      }],
    });

    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const jobs = JSON.parse(text);
    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("get-job-links error:", err);
    return NextResponse.json({ error: "Failed to fetch job links" }, { status: 500 });
  }
}
