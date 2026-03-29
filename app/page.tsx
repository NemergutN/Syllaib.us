"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 text-amber-950 font-sans">
      <div className="px-8 py-5 border-b border-amber-200">
        <header className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">Syllabus.AI</h1>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm px-3 py-2 rounded-full hover:bg-amber-100">
              Log in
            </Link>
            <Link href="/register" className="text-sm bg-amber-900 text-amber-50 px-4 py-2 rounded-full hover:bg-amber-800">
              Sign up
            </Link>
          </div>
        </header>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-12">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs tracking-wide uppercase text-amber-500 mb-2">Academic planning, simplified</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-amber-950">
              Turn syllabus chaos into an action plan
            </h2>
            <p className="text-amber-700 mt-4 max-w-xl">Upload your course syllabus, and Syllabus.AI auto-extracts deadlines, grading, and checkpoints so you can focus on what matters: learning and leveling up.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="bg-amber-900 text-amber-50 px-5 py-3 rounded-full text-sm font-medium hover:bg-amber-800">
                Get started
              </Link>
              <Link href="/login" className="border border-amber-300 px-5 py-3 rounded-full text-sm font-medium hover:bg-amber-100">
                Already have an account?
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-amber-950 mb-3">Example auto-generated plan</h3>
            <ul className="space-y-2 text-amber-700 text-sm">
              <li>• 03/29 - Read Chapter 1 &amp; submit quiz</li>
              <li>• 04/06 - Assignment 1 due (20%)</li>
              <li>• 04/15 - Midterm practice &amp; class review</li>
              <li>• 05/10 - Group presentation prep</li>
              <li>• 05/30 - Final project due</li>
            </ul>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-5">
          <div className="bg-white border border-amber-200 rounded-2xl p-6 text-amber-950">
            <h4 className="font-semibold">Instant extraction</h4>
            <p className="mt-2 text-amber-600 text-sm">Drag in your syllabus and see deadlines, grades, and priorities automatically pulled out.</p>
          </div>
          <div className="bg-white border border-amber-200 rounded-2xl p-6 text-amber-950">
            <h4 className="font-semibold">Track with workflow</h4>
            <p className="mt-2 text-amber-600 text-sm">Personalized roadmap keeps your weekly work aligned with final targets.</p>
          </div>
          <div className="bg-white border border-amber-200 rounded-2xl p-6 text-amber-950">
            <h4 className="font-semibold">Stay ahead</h4>
            <p className="mt-2 text-amber-600 text-sm">Build habits around real due dates. Never miss another submission window.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

