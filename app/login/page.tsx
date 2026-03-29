"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const Login = () => {
  const router = useRouter();
  const { status, data: session } = useSession();

  // allow login page view even when already authenticated
  // for account switching

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      return setError("Please fill in all fields");
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("Unable to login, please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col font-sans">
      
      {/* Nav */}
      <div className="px-8 py-5 border-b border-amber-200 flex items-center justify-between">
        <h1 className="text-center text-xl font-semibold tracking-tight text-amber-900">
          Syllaib.us
        </h1>
        {status === "authenticated" && session?.user && (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <span>Signed in as {session.user.email ?? session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-amber-900 underline"
            >
              Switch account
            </button>
          </div>
        )}
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
            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="w-full border border-amber-200 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition text-amber-950 flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.3H272v95.1h146.8c-6.4 34-25.6 62.8-54.7 82l88.2 68.8c51.4-47.4 81.2-117.2 81.2-195.6z"/>
                <path fill="#34A853" d="M272 544.3c73.7 0 135.8-24.5 181.1-66.7l-88.2-68.8c-24.6 16.6-56 26.4-92.9 26.4-71.4 0-132-48.3-153.6-113.2H26.5v71.1C70.5 497.3 166.6 544.3 272 544.3z"/>
                <path fill="#FBBC05" d="M118.4 323.1c-10.3-30.5-10.3-63.5 0-94L26.5 158c-38 75.9-38 166 0 241.9l91.9-76.8z"/>
                <path fill="#EA4335" d="M272 107.6c39.9-.6 78.5 14.5 107.8 41.8l81.1-78.6C404.9 24.2 344.9-1 272 0 166.6 0 70.5 47 26.5 119.9l91.9 76.8C140 156 200.6 107.6 272 107.6z"/>
              </svg>
              Continue with Google
            </button>

            <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="w-full border border-amber-200 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition text-amber-950 flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.8.5.9 5.4.9 11.7c0 5 3.2 9.2 7.6 10.7.6.1.8-.2.8-.6v-2.1c-3.1.7-3.8-1.4-3.8-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.7 2 .9.1-.7.4-1.2.7-1.5-2.5-.3-5.2-1.2-5.2-5.3 0-1.2.4-2.1 1.1-2.8-.1-.2-.5-1.4.1-2.9 0 0 .9-.3 2.8 1.1.8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c1.9-1.4 2.8-1.1 2.8-1.1.6 1.5.2 2.6.1 2.9.7.7 1.1 1.6 1.1 2.8 0 4.1-2.7 4.9-5.2 5.3.4.4.8 1 .8 2v2.9c0 .4.2.7.8.6 4.4-1.5 7.6-5.7 7.6-10.7C23.1 5.4 18.2.5 12 .5z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-amber-600 mt-6">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-amber-900 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;