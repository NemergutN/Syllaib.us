import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import clientPromise from "@/app/db";

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Pull major/careerGoal from DB if user is logged in, else fall back to body
  let major = "";
  let careerGoal = "";
  let courseNames: string[] = [];

  if (session?.user?.email) {
    const client = await clientPromise;
    const user = await client
      .db("syllabusDataBase")
      .collection("Users")
      .findOne(
        { email: session.user.email.toLowerCase() },
        { projection: { major: 1, careerGoal: 1 } }
      );
    major = user?.major ?? "";
    careerGoal = user?.careerGoal ?? "";
  }

  const body = await req.json();
  if (!major) major = body.major ?? "";
  if (!careerGoal) careerGoal = body.careerGoal ?? "";

  const courses = body.courses ?? [];
  if (Array.isArray(courses)) {
    for (const c of courses) {
      if (typeof c === "string") courseNames.push(c);
      else if (c.courseName) courseNames.push(c.courseName);
    }
  }

  const prompt = `You are an expert academic advisor building an interactive knowledge tree for a student.

STUDENT PROFILE:
- Major: ${major || "Not specified"}
- Career Goal: ${careerGoal || "Not specified"}
- Current Courses: ${courseNames.length > 0 ? courseNames.join(", ") : "None uploaded yet"}

Build a clickable decision/exploration tree showing paths from where they are now toward their goal.

TREE STRUCTURE RULES:
- Root node (type "root"): their career goal as the destination
- Level 1 children (type "area"): 3–4 broad areas they need to develop (e.g. "Technical Skills", "Portfolio", "Networking", "Certifications")
- Level 2 children (type "skill"): 2–3 specific skills or sub-topics within each area
- Level 3 children (type "action"): 2–3 concrete, immediately actionable steps for each skill — THIS IS THE MAX DEPTH, no children here

ID RULES: use short snake_case IDs, unique across the entire tree.

Return ONLY valid JSON, no markdown, no explanation:

{
  "title": "<short title for this map, e.g. 'Path to Software Engineer'>",
  "root": {
    "id": "goal",
    "label": "<career goal, max 5 words>",
    "description": "<one sentence about this goal>",
    "type": "root",
    "children": [
      {
        "id": "<area_id>",
        "label": "<area name, max 3 words>",
        "description": "<one sentence>",
        "type": "area",
        "children": [
          {
            "id": "<skill_id>",
            "label": "<skill name, max 4 words>",
            "description": "<one sentence>",
            "type": "skill",
            "children": [
              {
                "id": "<action_id>",
                "label": "<action, max 5 words>",
                "description": "<specific actionable step>",
                "type": "action",
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
}`;

  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const raw = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let knowledgeMap: unknown;
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    knowledgeMap = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse response. Try again.", raw },
      { status: 500 }
    );
  }

  return NextResponse.json({ knowledgeMap });
}
