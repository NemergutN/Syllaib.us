import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type ApolloCompany = {
  id: string;
  name: string;
};

type ApolloJobPosting = {
  id: string;
  title: string;
  url?: string;
  location?: string;
};

type JobResult = {
  company: string;
  title: string;
  url?: string;
  location?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { courses } = (await req.json()) as { courses: string[] };

    // Step 1: Use Gemini to generate relevant company names
    const geminiCompanyRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `A student is taking these courses: ${courses.join(", ")}.
List 5 real companies that hire students with this background. Return ONLY a JSON array of company name strings, e.g. ["Google", "Meta", "Stripe"].`,
      config: { responseMimeType: "application/json" },
    });

    const companyNames: string[] = JSON.parse(geminiCompanyRes.text!);
    console.log("Step 1 - Gemini company names:", companyNames);

    // Step 2: Search Apollo for each company and collect IDs
    const companies: ApolloCompany[] = [];

    for (const name of companyNames) {
      const res = await fetch("https://api.apollo.io/api/v1/mixed_companies/search", {
        method: "POST",
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          accept: "application/json",
          "Api-Key": process.env.APOLLO_API_KEY!,
        },
        body: JSON.stringify({ q_organization_name: name, per_page: 1 }),
      });
      const text = await res.text();
      console.log(`Step 2 - Apollo search for "${name}":`, text);
      const data = JSON.parse(text);
      const first = data?.organizations?.[0];
      if (first?.id) companies.push({ id: first.id, name: first.name ?? name });
    }
    console.log("Step 2 - Resolved companies:", companies);

    // Step 3: Get job postings for each company
    const allJobs: JobResult[] = [];

    for (const company of companies) {
      const res = await fetch(
        `https://api.apollo.io/api/v1/organizations/${company.id}/job_postings`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            accept: "application/json",
            "Api-Key": process.env.APOLLO_API_KEY!,
          },
        }
      );
      const text = await res.text();
      console.log(`Step 3 - Job postings for "${company.name}":`, text);
      const data = JSON.parse(text);
      const postings: ApolloJobPosting[] = data?.job_postings ?? [];
      for (const job of postings) {
        allJobs.push({
          company: company.name,
          title: job.title,
          url: job.url,
          location: job.location,
        });
      }
    }
    console.log("Step 3 - All jobs collected:", allJobs);

    // Step 4: Use Gemini to filter to the most relevant jobs
    const filterRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `A student is taking: ${courses.join(", ")}.
Here are job postings: ${JSON.stringify(allJobs)}.
Return ONLY a JSON array of the 5 most relevant jobs in this format:
[{ "company": "string", "title": "string", "url": "string", "location": "string" }]`,
      config: { responseMimeType: "application/json" },
    });

    const filtered = JSON.parse(filterRes.text!);
    console.log("Step 4 - Gemini filtered jobs:", filtered);
    return NextResponse.json({ jobs: filtered });
  } catch (err) {
    console.error("get-job-links error:", err);
    return NextResponse.json({ error: "Failed to fetch job links" }, { status: 500 });
  }
}
