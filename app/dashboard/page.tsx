"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ClassCard from "../components/class_card";

type SyllabusData = {
  courseName: string;
  courseCode: string;
  lectures: { day: string; time: string }[];
  officeHours: { day: string; time: string; instructor?: string }[];
  grading: { category: string; weight: number }[];
  deadlines: { title: string; date: string }[];
};

type Recommendation = {
  title: string;
  reason: string;
  skills: string[];
};

export default function Dashboard() {
  const [courses, setCourses] = useState<SyllabusData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("courses") ?? "[]") as SyllabusData[];
    setCourses(stored);
    if (stored.length > 0) fetchRecommendations(stored);
  }, []);

  async function fetchRecommendations(data: SyllabusData[]) {
    setLoadingRecs(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: data.map((c) => c.courseName) }),
      });
      const json = await res.json();
      if (res.ok) setRecommendations(json.recommendations);
    } finally {
      setLoadingRecs(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-syllabus", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unknown error");

      const updated = [...courses, json.data as SyllabusData];
      localStorage.setItem("courses", JSON.stringify(updated));
      setCourses(updated);
      fetchRecommendations(updated);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function clearAll() {
    localStorage.removeItem("courses");
    setCourses([]);
    setRecommendations([]);
    router.push("/");
  }

  const allDeadlines = courses
    .flatMap((c) => c.deadlines.map((d) => ({ ...d, course: c.courseCode })))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-amber-50 font-sans">

      {/* Nav */}
      <div className="px-8 py-5 border-b border-amber-200 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-amber-900">Syllabus.AI</h1>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-amber-900 text-amber-50 px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-800 active:scale-95 transition-all disabled:opacity-50"
          >
            {uploading ? "Parsing…" : "+ Add Course"}
          </button>
          <button onClick={clearAll} className="text-sm text-amber-400 hover:text-amber-600 transition-colors">
            Clear all
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {uploadError}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">

        {/* Courses */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">Your Courses</h2>
          {courses.length === 0 ? (
            <p className="text-amber-600 text-sm">No courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c, i) => (
                <ClassCard
                  key={i}
                  courseName={c.courseName}
                  courseCode={c.courseCode}
                  lectures={c.lectures}
                  officeHours={c.officeHours}
                  grading={c.grading}
                />
              ))}
            </div>
          )}
        </section>

        {/* Unified deadlines */}
        {allDeadlines.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">All Deadlines</h2>
            <div className="bg-white border border-amber-200 rounded-2xl p-6">
              <ul className="flex flex-col gap-2">
                {allDeadlines.map((d, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400 w-16">{d.course}</span>
                      <span className="text-amber-800">{d.title}</span>
                    </div>
                    <span className="text-amber-400">{d.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Job recommendations */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">Career Recommendations</h2>
          {loadingRecs ? (
            <p className="text-amber-600 text-sm">Generating recommendations…</p>
          ) : recommendations.length === 0 ? (
            <p className="text-amber-600 text-sm">Upload a course to see recommendations.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((r, i) => (
                <div key={i} className="bg-white border border-amber-200 rounded-2xl p-5 flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-amber-950">{r.title}</h3>
                  <p className="text-sm text-amber-600">{r.reason}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {r.skills.map((s, j) => (
                      <span key={j} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
