"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClassCard from "../components/class_card";
import JobLinks from "../components/job_links";
import UserMenu from "../components/UserMenu";
// ── Roadmap ───────Deepti───────────────────────────────────────────────────────
import RoadmapView, { type RoadmapData } from "../components/roadmapView";
import KnowledgeMap, { type KnowledgeMapData } from "../components/map_node";


type SyllabusData = {
  syllabusId?: string;
  courseName: string;
  courseCode: string;
  lectures: { day: string; time: string }[];
  officeHours: { day: string; time: string; instructor?: string }[];
  grading: { category: string; weight: number }[];
  deadlines: { title: string; date: string }[];
  drops: string;
};

type Recommendation = {
  title: string;
  reason: string;
  skills: string[];
};

type Job = {
  company: string;
  title: string;
  url?: string;
  location?: string;
};


export default function Dashboard() {
  const [courses, setCourses] = useState<SyllabusData[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const router = useRouter();
  const { status, data: session } = useSession();
  // ── Roadmap state ─────Deepti────────────────────────────────────────────────────
  const [major, setMajor] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [tab, setTab] = useState<"courses" | "roadmap">("courses");
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMapData | null>(null);
  const [generatingMap, setGeneratingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // ── Fetch courses from MongoDB ────────────────────────────────────────────────
  async function fetchCourses() {
    setLoadingCourses(true);
    try {
      const res = await fetch("/api/syllabuses");
      const json = await res.json();
      if (res.ok && json.syllabi) {
        setCourses(json.syllabi);
        if (json.syllabi.length > 0) {
          fetchRecommendations(json.syllabi);
          fetchJobs(json.syllabi);
        }
      }
    } finally {
      setLoadingCourses(false);
    }
  }

  // Load everything once session is confirmed authenticated
  useEffect(() => {
    if (status !== "authenticated") return;

    fetchCourses();

    fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.major !== undefined) setMajor(json.major ?? "");
        if (json.careerGoal !== undefined) setCareerGoal(json.careerGoal ?? "");
      })
      .catch(() => {});

    const userKey = (session?.user as any)?.id || session?.user?.email || "guest";
    const savedRoadmap = localStorage.getItem(`roadmap:${userKey}`);
    const savedMap = localStorage.getItem(`knowledgeMap:${userKey}`);

    if (savedRoadmap) {
      try { setRoadmap(JSON.parse(savedRoadmap)); } catch { localStorage.removeItem(`roadmap:${userKey}`); }
    }
    if (savedMap) {
      try {
        const parsed = JSON.parse(savedMap);
        if (parsed?.root) setKnowledgeMap(parsed);
        else localStorage.removeItem(`knowledgeMap:${userKey}`);
      } catch { localStorage.removeItem(`knowledgeMap:${userKey}`); }
    }
  }, [status, session]);

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
      // Re-fetch from DB so the list is always in sync
      await fetchCourses();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function clearAll() {
    await fetch("/api/syllabuses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const userKey = (session?.user as any)?.id || session?.user?.email || "guest";
    localStorage.removeItem(`roadmap:${userKey}`);
    localStorage.removeItem(`knowledgeMap:${userKey}`);
    setMajor("");
    setCareerGoal("");
    setRoadmap(null);
    setKnowledgeMap(null);
    setCourses([]);
    setRecommendations([]);
    router.push("/");
  }

  async function fetchJobs(data: SyllabusData[]) {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/get-job-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: data.map((c) => c.courseName) }),
      });
      const json = await res.json();
      if (res.ok) setJobs(json.jobs);
    } finally {
      setLoadingJobs(false);
    }
  }


  // ── Save profile ───Deep───────────────────────────────────────────────────────
async function saveProfile() {
  await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ major, careerGoal }),
  });
  setProfileSaved(true);
  setTimeout(() => setProfileSaved(false), 2000);
  if (courses.length > 0) fetchRecommendations(courses);
}

// ── Generate roadmap ──────Deep────────────────────────────────────────────────
async function generateRoadmap() {
  if (!major.trim() || !careerGoal.trim()) {
    setRoadmapError("Fill in your major and career goal first.");
    return;
  }
  setGeneratingRoadmap(true);
  setRoadmapError(null);
  try {
    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courses, major, careerGoal }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to generate roadmap");
    setRoadmap(json.roadmap);
    const userKey = (session?.user as any)?.id || session?.user?.email || "guest";
    localStorage.setItem(`roadmap:${userKey}`, JSON.stringify(json.roadmap));
    setTab("roadmap");
  } catch (err) {
    setRoadmapError(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setGeneratingRoadmap(false);
  }
}

async function generateMap() {
  setGeneratingMap(true);
  setMapError(null);
  try {
    const res = await fetch("/api/knowledge-map", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courses, major, careerGoal }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to generate map");
    setKnowledgeMap(json.knowledgeMap);
    const userKey = (session?.user as any)?.id || session?.user?.email || "guest";
    localStorage.setItem(`knowledgeMap:${userKey}`, JSON.stringify(json.knowledgeMap));
  } catch (err) {
    setMapError(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setGeneratingMap(false);
  }
}

  const allDeadlines = courses
    .flatMap((c) => c.deadlines.map((d) => ({ ...d, course: c.courseCode })))
    .sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (isNaN(da) || isNaN(db)) return a.date.localeCompare(b.date);
      return da - db;
    });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-amber-400 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 font-sans">

      {/* Nav */}
      <div className="px-8 py-5 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserMenu onUpload={() => fileInputRef.current?.click()} />
          <h1 className="text-xl font-semibold tracking-tight text-amber-900">Syllaib.us</h1>
        </div>
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

        {/* ── Profile: major + career goal ───────deepti────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">
          Your Profile
        </h2>
        <div className="bg-white border border-amber-200 rounded-2xl p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-amber-400 block mb-1.5">
                Major
              </label>
              <input
                className="w-full border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-950 outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-amber-300 transition-all"
                placeholder="e.g. Computer Science"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-amber-400 block mb-1.5">
                Career Goal
              </label>
              <input
                className="w-full border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-950 outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-amber-300 transition-all"
                placeholder="e.g. Software Engineer at a top tech company"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={saveProfile}
              disabled={!major.trim() || !careerGoal.trim()}
              className="bg-amber-900 text-amber-50 px-5 py-2 rounded-full text-sm font-medium hover:bg-amber-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Profile
            </button>
            <button
              onClick={generateRoadmap}
              disabled={generatingRoadmap || !major.trim() || !careerGoal.trim()}
              className="border border-amber-300 text-amber-800 px-5 py-2 rounded-full text-sm font-medium hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generatingRoadmap ? "Generating…" : "Generate Roadmap →"}
            </button>
            {profileSaved && (
              <span className="text-xs text-green-600">✓ Saved</span>
            )}
            {roadmapError && (
              <span className="text-xs text-red-500">{roadmapError}</span>
            )}
          </div>
        </div>
      </section>

      {/* ── Tabs (only appears once roadmap exists) ─────────────────────────── */}
      {roadmap && (
        <div className="flex gap-2">
          {(["courses", "roadmap"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all capitalize ${
                tab === t
                  ? "bg-amber-900 text-amber-50"
                  : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {t === "roadmap" ? "My Roadmap" : "Courses"}
            </button>
          ))}
        </div>
      )}

      {/* ── Roadmap tab ──────────────────────────────────────────────────────── */}
      {tab === "roadmap" && roadmap && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Your Roadmap
            </h2>
            <button
              onClick={generateRoadmap}
              disabled={generatingRoadmap}
              className="text-xs text-amber-500 hover:text-amber-700 transition-colors disabled:opacity-40"
            >
              {generatingRoadmap ? "Regenerating…" : "↻ Regenerate"}
            </button>
          </div>
          <RoadmapView roadmap={roadmap} />
        </section>
      )}

        {(tab === "courses" || !roadmap) && (
          <>
        {/* Courses */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">Your Courses</h2>
          {loadingCourses ? (
            <p className="text-amber-600 text-sm">Loading courses…</p>
          ) : courses.length === 0 ? (
            <p className="text-amber-600 text-sm">No courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c, i) => (
                <ClassCard
                  key={c.syllabusId ?? i}
                  courseName={c.courseName}
                  courseCode={c.courseCode}
                  lectures={c.lectures}
                  officeHours={c.officeHours}
                  grading={c.grading}
                  drops={c.drops}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              {recommendations.map((r, i) => (
                <div key={i} className="bg-white border border-amber-200 rounded-2xl p-5 flex flex-col gap-2 hover:bg-amber-50 hover:scale-[1.02] hover:shadow-md transition-all duration-300 ease-in-out group">
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

        {/* Job links */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">Job Listings</h2>
          {loadingJobs ? (
            <p className="text-amber-600 text-sm">Finding job listings…</p>
          ) : jobs.length === 0 ? (
            <p className="text-amber-600 text-sm">Upload a course to see job listings.</p>
          ) : (
            <JobLinks jobs={jobs} />
          )}
        </section>

          </>
        )}

        {/* Knowledge Map */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-500">Knowledge Map</h2>
            <button
              onClick={generateMap}
              disabled={generatingMap}
              className="border border-amber-300 text-amber-800 px-4 py-1.5 rounded-full text-xs font-medium hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generatingMap ? "Generating…" : knowledgeMap ? "↻ Regenerate" : "Generate map"}
            </button>
          </div>
          {mapError && <p className="text-xs text-red-500 mb-3">{mapError}</p>}
          {knowledgeMap ? (
            <KnowledgeMap data={knowledgeMap} />
          ) : (
            <div className="bg-white border border-amber-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-amber-400 text-sm">No knowledge map yet.</p>
              <p className="text-amber-300 text-xs max-w-xs">Generate a map to visualise how your skills and goals connect.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
