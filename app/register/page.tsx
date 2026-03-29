"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, RegisterState } from "@/actions/auth";

const initialState: RegisterState = {};

export default function Register() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col font-sans">

      {/* Nav */}
      <div className="px-8 py-5 border-b border-amber-200">
        <h1 className="text-center text-xl font-semibold tracking-tight text-amber-900">
          Syllabus.AI
        </h1>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-white border border-amber-200 rounded-2xl p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-amber-950 text-center mb-2">
            Create account
          </h2>
          <p className="text-sm text-amber-600 text-center mb-6">
            Start organizing your semester in seconds.
          </p>

          <form action={formAction} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <input
                name="username"
                placeholder="Username"
                className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-amber-950"
              />
              {state.errors?.username && (
                <p className="text-red-600 text-xs px-1">{state.errors.username[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-amber-950"
              />
              {state.errors?.email && (
                <p className="text-red-600 text-xs px-1">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-amber-950"
              />
              {state.errors?.password && (
                <p className="text-red-600 text-xs px-1">{state.errors.password[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-amber-950"
              />
              {state.errors?.confirmPassword && (
                <p className="text-red-600 text-xs px-1">{state.errors.confirmPassword[0]}</p>
              )}
            </div>

            {state.errors?.general && (
              <p className="text-red-600 text-sm text-center">{state.errors.general[0]}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 bg-amber-900 text-amber-50 py-3 rounded-full text-sm font-medium hover:bg-amber-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? "Creating account..." : "Sign up"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-amber-200" />
            <span className="text-xs text-amber-500">or</span>
            <div className="flex-1 h-px bg-amber-200" />
          </div>

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3">
            <button className="w-full border border-amber-200 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition text-amber-950">
              Continue with Google
            </button>
            <button className="w-full border border-amber-200 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition text-amber-950">
              Continue with GitHub
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-amber-600 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-amber-900 font-medium cursor-pointer hover:underline"
            >
              Log in
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}