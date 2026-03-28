import Image from "next/image";

export default function Home() {
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
        <button className="mt-2 bg-amber-900 text-amber-50 px-6 py-3 rounded-full text-sm font-medium hover:bg-amber-800 active:scale-95 transition-all">
          Upload Syllabus
        </button>
      </div>

      {/* Features */}
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

    </div>
  );
}
