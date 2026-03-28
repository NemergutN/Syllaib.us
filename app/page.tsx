"use client";

import { useRef, useState } from "react";
import ClassCard from "./components/class_card";

type SyllabusData = {
  courseName: string;
  courseCode: string;
  lectures: { day: string; time: string }[];
  officeHours: { day: string; time: string; instructor?: string }[];
  grading: { category: string; weight: number }[];
  deadlines: { title: string; date: string }[];
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSyllabus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-syllabus", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unknown error");
      setSyllabus(json.data as SyllabusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 w-full font-sans">

      {/* Nav */}
      <div className="px-8 py-5 border-b border-amber-200">
        <h1 className="text-center text-xl font-semibold tracking-tight text-amber-900">
          Syllabus.AI
        </h1>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 py-20 gap-6">
        <h2 className="text-4xl font-bold text-amber-950 tracking-tight max-w-md leading-tight">
          Turn your syllabus into a plan.
        </h2>
        <p className="text-amber-700 text-base max-w-sm">
          Upload your syllabus and we'll extract your deadlines, grades, and goals — instantly.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="mt-2 bg-amber-900 text-amber-50 px-6 py-3 rounded-full text-sm font-medium hover:bg-amber-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Parsing…" : "Upload Syllabus"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Result */}
      {syllabus && (
        <div className="px-6 pb-20 max-w-2xl mx-auto flex flex-col gap-6">
          <ClassCard
            courseName={syllabus.courseName}
            courseCode={syllabus.courseCode}
            lectures={syllabus.lectures}
            officeHours={syllabus.officeHours}
            grading={syllabus.grading}
          />

          {syllabus.deadlines.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-2xl p-6">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">Deadlines</h4>
              <ul className="flex flex-col gap-2">
                {syllabus.deadlines.map((d, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-amber-800">{d.title}</span>
                    <span className="text-amber-400">{d.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Features (shown when no result yet) */}
      {!syllabus && (
        <div className="px-6 pb-20 max-w-2xl mx-auto flex flex-col gap-4">
          <div className="bg-white border border-amber-200 rounded-2xl p-6">
            <span className="text-xs font-mono text-amber-400 mb-2 block">01</span>
            <h3 className="text-base font-semibold text-amber-950">Get a timeline</h3>
            <p className="text-sm text-amber-600 mt-1">Every deadline pulled out and laid out in order, so nothing sneaks up on you.</p>
          </div>
          <div className="bg-white border border-amber-200 rounded-2xl p-6">
            <span className="text-xs font-mono text-amber-400 mb-2 block">02</span>
            <h3 className="text-base font-semibold text-amber-950">Get a grade breakdown</h3>
            <p className="text-sm text-amber-600 mt-1">See exactly how your final grade is weighted — assignments, exams, participation, and more.</p>
          </div>
          <div className="bg-amber-900 rounded-2xl p-6">
            <span className="text-xs font-mono text-amber-400 mb-2 block">03</span>
            <h3 className="text-base font-semibold text-amber-50">Prepare for your future</h3>
            <p className="text-sm text-amber-300 mt-1">Our AI connects what you're studying to real career goals — so your coursework has direction.</p>
          </div>
        </div>
      )}

    </div>
  );
}
