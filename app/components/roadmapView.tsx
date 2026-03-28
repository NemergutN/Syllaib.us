"use client";

export type RoadmapData = {
  skillMatchScore: number;
  motivationalInsight: string;
  currentStrengths: string[];
  skillGaps: {
    skill: string;
    importance: string;
    howToLearn: string;
    estimatedTime: string;
  }[];
  thisSemersterActions: {
    action: string;
    category: string;
    priority: number;
    deadline: string;
    why: string;
  }[];
  next6Months: string[];
  nextYear: string[];
  recommendedProjects: {
    name: string;
    description: string;
    skillsItBuilds: string[];
    difficulty: string;
    estimatedHours: number;
  }[];
  recommendedCertifications: {
    name: string;
    provider: string;
    relevance: string;
    cost: string;
    timeToComplete: string;
  }[];
  weeklyPlan: {
    focus: string;
    tasks: string[];
    timeEstimateHours: number;
  }[];
};

const importanceStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  important: "bg-amber-100 text-amber-700",
  "nice-to-have": "bg-green-100 text-green-700",
};

const categoryStyles: Record<string, string> = {
  project: "bg-blue-100 text-blue-700",
  certification: "bg-purple-100 text-purple-700",
  coursework: "bg-amber-100 text-amber-700",
  networking: "bg-green-100 text-green-700",
  application: "bg-pink-100 text-pink-700",
};

const difficultyStyles: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

export default function RoadmapView({ roadmap }: { roadmap: RoadmapData }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Score banner */}
      <div className="bg-amber-900 rounded-2xl p-6 text-white">
        <p className="text-amber-300 text-xs uppercase tracking-widest mb-1">
          Career Match Score
        </p>
        <p className="text-6xl font-bold mb-3">{roadmap.skillMatchScore}%</p>
        <div className="w-full bg-amber-800 rounded-full h-1.5 mb-4">
          <div
            className="bg-amber-300 h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${roadmap.skillMatchScore}%` }}
          />
        </div>
        <p className="text-amber-200 text-sm leading-relaxed">
          {roadmap.motivationalInsight}
        </p>
      </div>

      {/* Current strengths */}
      <div className="bg-white border border-amber-200 rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-3">
          Current Strengths
        </p>
        <div className="flex flex-wrap gap-2">
          {roadmap.currentStrengths.map((s, i) => (
            <span
              key={i}
              className="bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium"
            >
              ✓ {s}
            </span>
          ))}
        </div>
      </div>

      {/* Skill gaps */}
      <div className="bg-white border border-amber-200 rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-3">
          Skill Gaps to Close
        </p>
        <div className="flex flex-col divide-y divide-amber-50">
          {roadmap.skillGaps.map((gap, i) => (
            <div key={i} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-amber-950">
                  {gap.skill}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    importanceStyles[gap.importance] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {gap.importance}
                </span>
              </div>
              <p className="text-xs text-amber-700 mb-1">{gap.howToLearn}</p>
              <p className="text-xs text-amber-400">⏱ {gap.estimatedTime}</p>
            </div>
          ))}
        </div>
      </div>

      {/* This semester actions */}
      <div className="bg-white border border-amber-200 rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-3">
          This Semester — Priority Actions
        </p>
        <div className="flex flex-col divide-y divide-amber-50">
          {(roadmap.thisSemersterActions ?? [])
            .sort((a, b) => a.priority - b.priority)
            .map((item, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-900 text-amber-50 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {item.priority}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-950 mb-0.5">
                    {item.action}
                  </p>
                  <p className="text-xs text-amber-500 mb-2">{item.why}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        categoryStyles[item.category] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 border border-amber-100">
                      {item.deadline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Weekly plan */}
      {roadmap.weeklyPlan?.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-3">
            This Week's Focus
          </p>
          {roadmap.weeklyPlan.slice(0, 3).map((w, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-amber-950">
                  {w.focus}
                </span>
                <span className="text-xs text-amber-400 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  ~{w.timeEstimateHours}h
                </span>
              </div>
              {w.tasks.map((t, j) => (
                <p key={j} className="text-xs text-amber-600 pl-3 py-0.5">
                  · {t}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Recommended projects */}
      <div className="bg-white border border-amber-200 rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-3">
          Build These Projects
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roadmap.recommendedProjects.map((p, i) => (
            <div
              key={i}
              className="bg-amber-50 rounded-xl p-4 border border-amber-100"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-amber-950">{p.name}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    difficultyStyles[p.difficulty] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.difficulty}
                </span>
              </div>
              <p className="text-xs text-amber-600 leading-relaxed mb-2">
                {p.description}
              </p>
              <p className="text-xs text-amber-400 mb-2">
                ⏱ ~{p.estimatedHours} hours
              </p>
              <div className="flex flex-wrap gap-1">
                {p.skillsItBuilds.map((s, j) => (
                  <span
                    key={j}
                    className="text-xs bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white border border-amber-200 rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-3">
          Recommended Certifications
        </p>
        <div className="flex flex-col divide-y divide-amber-50">
          {roadmap.recommendedCertifications.map((c, i) => (
            <div
              key={i}
              className="py-3 first:pt-0 last:pb-0 flex justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-amber-950">{c.name}</p>
                <p className="text-xs text-amber-400 mb-1">{c.provider}</p>
                <p className="text-xs text-amber-600">{c.relevance}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-amber-900">{c.cost}</p>
                <p className="text-xs text-amber-400 mt-0.5">{c.timeToComplete}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next 6 months + next year side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white border border-amber-200 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-3">
            Next 6 Months
          </p>
          {roadmap.next6Months.map((item, i) => (
            <p
              key={i}
              className="text-xs text-amber-800 py-1.5 border-b border-amber-50 last:border-0"
            >
              · {item}
            </p>
          ))}
        </div>
        <div className="bg-white border border-amber-200 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-3">
            Next Year
          </p>
          {(roadmap.nextYear ?? []).map((item, i) => (
            <p
              key={i}
              className="text-xs text-amber-800 py-1.5 border-b border-amber-50 last:border-0"
            >
              · {item}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
}