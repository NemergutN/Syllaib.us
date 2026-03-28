import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const lectureSchema = z.object({
  day: z.string().describe("Day of the week."),
  time: z.string().describe("Time of the lecture, e.g. '10:00–11:15 AM'."),
});

const officeHourSchema = z.object({
  day: z.string().describe("Day of the week."),
  time: z.string().describe("Time of office hours."),
  instructor: z.string().optional().describe("Name of the instructor or TA."),
});

const gradingSchema = z.object({
  category: z.string().describe("Name of the graded component, e.g. 'Homework'."),
  weight: z.number().describe("Percentage weight out of 100."),
});

const deadlineSchema = z.object({
  title: z.string().describe("Name of the assignment or exam."),
  date: z.string().describe("Due date as a string."),
});

const syllabusSchema = z.object({
  courseName: z.string().describe("Full name of the course."),
  courseCode: z.string().describe("Course code, e.g. 'CS 401'."),
  lectures: z.array(lectureSchema),
  officeHours: z.array(officeHourSchema),
  grading: z.array(gradingSchema),
  deadlines: z.array(deadlineSchema),
  drops: z.string().describe("Amount of drops you have for homework, quizzes, etc. (specify)")
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: file.type || "application/pdf",
            data: base64,
          },
        },
        {
          text: `Extract the syllabus information from this document and return ONLY valid JSON matching this exact structure:
{
  "courseName": "full course name",
  "courseCode": "e.g. CS 401",
  "lectures": [{ "day": "Monday", "time": "9:20 PM - 10:40 PM" }],
  "officeHours": [{ "day": "Wednesday", "time": "2:30-5:30", "instructor": "John Doe" }],
  "grading": [{ "category": "Homework", "weight": 30 }],
  "deadlines": [{ "title": "Midterm Exam", "date": "Mar 2" }],
  "drops": "HW drops: 1, Quiz drops: 1, ...
}
For grading weights, extract the numeric percentage only (e.g. "30% Homework" → weight: 30). 
For drops, only specify a drop (i.e. HW drops) if there is a nonzero amount. If there is none, make it the string 'N/A'`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
    },
  });

  let parsed: z.infer<typeof syllabusSchema>;
  try {
    parsed = syllabusSchema.parse(JSON.parse(response.text!));
  } catch (err) {
    console.error("Zod validation error:", err);
    return NextResponse.json({ error: "Failed to parse Gemini response", raw: response.text }, { status: 500 });
  }

  return NextResponse.json({ data: parsed });
}
