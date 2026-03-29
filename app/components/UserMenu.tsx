"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function UserMenu({ onUpload }: { onUpload?: () => void }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!session?.user) return null;

  const name = session.user.name ?? session.user.email ?? "U";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const image = session.user.image;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full bg-amber-900 text-amber-50 text-sm font-semibold flex items-center justify-center overflow-hidden hover:bg-amber-800 active:scale-95 transition-all ring-2 ring-amber-200"
        aria-label="User menu"
      >
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {/* Popout */}
      <div
        className={`absolute left-0 top-11 w-56 bg-white border border-amber-200 rounded-2xl shadow-lg overflow-hidden z-50 transition-all duration-200 origin-top-left ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* User info header */}
        <div className="px-4 py-3 border-b border-amber-100">
          <p className="text-xs font-semibold text-amber-950 truncate">{name}</p>
          <p className="text-xs text-amber-400 truncate">{session.user.email}</p>
        </div>

        <div className="p-2 flex flex-col gap-0.5">
          {/* Upload */}
          <button
            onClick={() => { onUpload?.(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-amber-800 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-2.5"
          >
            <span className="text-base leading-none text-amber-400">↑</span>
            Upload syllabus
          </button>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="px-3 py-2 text-sm text-amber-800 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-2.5"
          >
            <span className="text-base leading-none text-amber-400">⊞</span>
            Dashboard
          </Link>

          <div className="h-px bg-amber-100 my-1" />

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 text-sm text-amber-800 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-2.5"
          >
            <span className="text-base leading-none text-amber-400">→</span>
            Sign out
          </button>

          {/* Delete account */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                // TODO: call delete account API
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-500 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2.5"
          >
            <span className="text-base leading-none">✕</span>
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
