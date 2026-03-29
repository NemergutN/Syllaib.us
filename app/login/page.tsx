"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      return setError("Please fill in all fields");
    }

    setLoading(true);

    // Fake login
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col font-sans">
      
      {/* Nav */}
      <div className="px-8 py-5 border-b border-amber-200">
        <h1 className="text-center text-xl font-semibold tracking-tight text-amber-900">
          Syllabus.AI
        </h1>
      </div>

      {/* Login Card */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-amber-950 text-center mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-amber-600 text-center mb-6">
            Log in to continue your progress.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-amber-950"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-amber-950"
            />

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-amber-900 text-amber-50 py-3 rounded-full text-sm font-medium hover:bg-amber-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-amber-200" />
            <span className="text-xs text-amber-500">or</span>
            <div className="flex-1 h-px bg-amber-200" />
          </div>

          {/* OAuth */}
          <div className="flex flex-col gap-3">
            <button className="w-full border border-amber-200 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition text-amber-950">
              Continue with Google
            </button>

            <button className="w-full border border-amber-200 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition text-amber-950">
              Continue with GitHub
            </button>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-amber-600 mt-6">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-amber-900 font-medium cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;