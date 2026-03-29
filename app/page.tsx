"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

const SLIDES = [
  {
    label: "Auto-generated plan",
    rows: [
      { left: "03/29", right: "Read Chapter 1 & submit quiz" },
      { left: "04/06", right: "Assignment 1 due (20%)" },
      { left: "04/15", right: "Midterm practice & class review" },
      { left: "05/10", right: "Group presentation prep" },
      { left: "05/30", right: "Final project due" },
    ],
  },
  {
    label: "Grade breakdown",
    rows: [
      { left: "20%", right: "Assignments (×4)" },
      { left: "15%", right: "Quizzes (weekly)" },
      { left: "25%", right: "Midterm exam" },
      { left: "10%", right: "Participation" },
      { left: "30%", right: "Final project" },
    ],
  },
  {
    label: "This week's priorities",
    rows: [
      { left: "Mon", right: "Review lecture slides from Week 3" },
      { left: "Tue", right: "Start Assignment 1 draft" },
      { left: "Wed", right: "Office hours — clarify rubric" },
      { left: "Thu", right: "Submit Chapter 1 quiz" },
      { left: "Fri", right: "Peer review partner's draft" },
    ],
  },
  {
    label: "Key checkpoints",
    rows: [
      { left: "Week 2", right: "Course drop deadline" },
      { left: "Week 5", right: "Proposal submission opens" },
      { left: "Week 8", right: "Midterm — covers Units 1–3" },
      { left: "Week 11", right: "Draft peer review due" },
      { left: "Week 15", right: "Final presentation day" },
    ],
  },
];

export default function Home() {
  const hero = useFadeIn();
  const preview = useFadeIn();
  const card1 = useFadeIn();
  const card2 = useFadeIn();
  const card3 = useFadeIn();

  const [slideIndex, setSlideIndex] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setSlideVisible(false);
      setTimeout(() => {
        setSlideIndex((i) => (i + 1) % SLIDES.length);
        setSlideVisible(true);
      }, 500);
    },4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 text-amber-950 font-sans">

      {/* Nav */}
      <div className="px-8 py-5 border-b border-amber-200">
        <header className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Syllaib.us</h1>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm px-3 py-2 rounded-full hover:bg-amber-100 transition-colors">
              Log in
            </Link>
            <Link href="/register" className="text-sm bg-amber-900 text-amber-50 px-4 py-2 rounded-full hover:bg-amber-800 transition-colors">
              Sign up
            </Link>
          </div>
        </header>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-16">

        {/* Hero */}
        <section className="grid md:grid-cols-[5fr_7fr] gap-10 items-center">
          <div
            ref={hero.ref}
            style={{ opacity: hero.visible ? 1 : 0, transform: hero.visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}
          >
            <p className="text-xs tracking-wide uppercase text-amber-500 mb-2">Academic planning, simplified</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-amber-950">
              Turn syllabus chaos into an action plan
            </h2>
            <p className="text-amber-700 mt-4 max-w-xl">
              Upload your course syllabus, and Syllaib.us auto-extracts deadlines, grading, and checkpoints so you can focus on what matters: learning and leveling up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="bg-amber-900 text-amber-50 px-5 py-3 rounded-full text-sm font-medium hover:bg-amber-800 active:scale-95 transition-all">
                Get started
              </Link>
              <Link href="/login" className="border border-amber-300 px-5 py-3 rounded-full text-sm font-medium hover:bg-amber-100 active:scale-95 transition-all">
                Already have an account?
              </Link>
            </div>
          </div>

          {/* Preview card */}
          <div
            ref={preview.ref}
            style={{ opacity: preview.visible ? 1 : 0, transform: preview.visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s" }}
            className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
          >
            <div style={{ opacity: slideVisible ? 1 : 0, transition: "opacity 0.4s ease" }}>
              <h3 className="text-lg font-semibold text-amber-950 mb-4">{SLIDES[slideIndex].label}</h3>
              <ul className="flex flex-col gap-5 text-sm">
                {SLIDES[slideIndex].rows.map((item, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-xs font-mono text-amber-400 w-20 shrink-0">{item.left}</span>
                    <span className="text-xs font-mono text-amber-700 shrink-0">{item.right}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-1.5 mt-5 justify-center">
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full transition-colors duration-300"
                  style={{ background: i === slideIndex ? "#92400e" : "#fcd34d" }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid md:grid-cols-3 gap-5">
          {[
            { fade: card1, delay: "0s", title: "Instant extraction", body: "Drag in your syllabus and see deadlines, grades, and priorities automatically pulled out." },
            { fade: card2, delay: "0.12s", title: "Track with workflow", body: "Personalized roadmap keeps your weekly work aligned with final targets." },
            { fade: card3, delay: "0.24s", title: "Stay ahead", body: "Build habits around real due dates. Never miss another submission window." },
          ].map(({ fade, delay, title, body }) => (
            <div
              key={title}
              ref={fade.ref}
              style={{ opacity: fade.visible ? 1 : 0, transform: fade.visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease ${delay}, transform 0.6s ease ${delay}` }}
            >
              <div className="bg-white border border-amber-200 rounded-2xl p-6 hover:shadow-md hover:scale-[1.03] transition-all duration-300 ease-in-out">
                <h4 className="font-semibold text-amber-950">{title}</h4>
                <p className="mt-2 text-amber-600 text-sm">{body}</p>
              </div>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}
