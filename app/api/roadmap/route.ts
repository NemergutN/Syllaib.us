import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { courses, major, careerGoal } = body;

  if (!major || !careerGoal) {
    return NextResponse.json(
      { error: "Major and career goal are required." },
      { status: 400 }
    );
  }

  const courseNames: string[] = [];
  const allSkills: string[] = [];
  const allTopics: string[] = [];

  if (Array.isArray(courses)) {
    for (const c of courses) {
      if (typeof c === "string") {
        courseNames.push(c);
      } else {
        if (c.courseName) courseNames.push(c.courseName);
        if (c.skillsGained) allSkills.push(...c.skillsGained);
        if (c.topicsCovered) allTopics.push(...c.topicsCovered);
      }
    }
  }

  // Step 1 — Gemini searches the web for real job market data (with grounding)
  let jobMarketContext = "";
  try {
    const searchModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }],
    });
    const searchResult = await searchModel.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `What are the most in-demand skills, tools, technologies, and qualifications for a ${careerGoal} in 2025? List specific programming languages, frameworks, certifications, and experiences that employers are actively requiring right now.`,
        }],
      }],
    });
    jobMarketContext = searchResult.response.text();
  } catch {
    jobMarketContext = `Use your knowledge of what a ${careerGoal} needs in 2025-2026.`;
  }

  // Step 2 — Gemini generates the full structured roadmap
  const prompt = `You are an overqualified expert academic and career advisor AI agent with 10+ years of experience. Generate a thorough, exhaustively personalized, but realistic career roadmap for this student.

STUDENT PROFILE:
- Major: ${major}
- Career Goal: ${careerGoal}

COURSES CURRENTLY TAKING:
${courseNames.length > 0 ? courseNames.join(", ") : "No courses uploaded yet — base advice on their major and goal."}

SKILLS BEING BUILT FROM COURSEWORK:
${allSkills.length > 0 ? [...new Set(allSkills)].join(", ") : "Not yet extracted — infer from the course names and major."}

TOPICS BEING STUDIED:
${allTopics.length > 0 ? [...new Set(allTopics)].join(", ") : "Not yet extracted — infer from the course names and major."}

LIVE JOB MARKET DATA (from Google Search, 2025-2026):
${jobMarketContext}

Important instructions:
- Be SPECIFIC to this student's actual courses and stated goal.
- Reference their actual course names where relevant.
- Every action item must be concrete and immediately actionable.
- The skillMatchScore should honestly reflect how well their current courses align with their goal, but not be extremely harsh.

Return ONLY valid JSON, no markdown fences, no explanation, nothing else:

{
  "skillMatchScore": <integer 0-100>,
  "motivationalInsight": "<2-3 sentences personalized to their specific major and goal, mention their actual courses if available>",
  "currentStrengths": ["<skill they are actively building from their coursework>"],
  "skillGaps": [
    {
      "skill": "<specific skill name>",
      "importance": "<critical|important|nice-to-have>",
      "howToLearn": "<specific actionable step — name a project, course, or resource>",
      "estimatedTime": "<e.g. 3 weeks>"
    }
  ],
  "thisSemersterActions": [
    {
      "action": "<specific action, reference their actual course or situation if possible>",
      "category": "<project|certification|coursework|networking|application>",
      "priority": <integer 1-5, 1 is highest>,
      "deadline": "<timeframe e.g. Next 2 weeks or End of semester>",
      "why": "<one sentence — why this specifically helps their stated goal>"
    }
  ],
  "next6Months": ["<specific action item>"],
  "nextYear": ["<specific action item>"],
  "recommendedProjects": [
    {
      "name": "<project name>",
      "description": "<2 sentences — what to build and why it matters for their goal>",
      "skillsItBuilds": ["<skill>"],
      "difficulty": "<beginner|intermediate|advanced>",
      "estimatedHours": <integer>
    }
  ],
  "recommendedCertifications": [
    {
      "name": "<certification name>",
      "provider": "<provider name>",
      "relevance": "<one sentence — why this cert specifically helps their goal>",
      "cost": "<free|$amount|paid>",
      "timeToComplete": "<timeframe>"
    }
  ],
  "weeklyPlan": [
    {
      "focus": "<focus area for the week>",
      "tasks": ["<concrete task 1>", "<concrete task 2>"],
      "timeEstimateHours": <integer>
    }
  ]
}`;

  const roadmapModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await roadmapModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const raw = result.response.text();

  let roadmap: unknown;
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    roadmap = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse response. Try again.", raw },
      { status: 500 }
    );
  }

  return NextResponse.json({ roadmap });
}
