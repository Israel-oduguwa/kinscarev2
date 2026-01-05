// components/MigrationBanner.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MigrationBanner() {
  const [visible, setVisible] = useState(false);
  const storageKey = "kinscare_migration_banner_dismissed_until";
  const dismissForDays = 7;

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      setVisible(true);
      return;
    }
    const until = Number(stored);
    if (!Number.isFinite(until) || Date.now() > until) {
      setVisible(true);
    }
  }, []);

  const dismissBanner = () => {
    const until = Date.now() + dismissForDays * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(storageKey, String(until));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative z-50 isolate flex items-center gap-x-6 overflow-hidden bg-slate-900/80 px-6 py-2.5 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10 sm:px-3.5 sm:before:flex-1">
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          className="aspect-577/310 w-[36rem] bg-linear-to-r from-indigo-400 via-sky-400 to-emerald-400 opacity-40"
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          className="aspect-[577/310] w-[36rem] bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 opacity-40"
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm leading-6 text-slate-50">
          <strong className="font-semibold">
            KinsCare has a new login experience
          </strong>
          <svg
            viewBox="0 0 2 2"
            aria-hidden="true"
            className="mx-2 inline h-1 w-1 fill-current"
          >
            <circle r="1" cx="1" cy="1" />
          </svg>
          If you already have an account, please sign in {" "}
          <span className="font-semibold">“again”</span>, We’ll send a one-time
          code to your email instead of using your old password.
        </p>
        <Link
          href="/signin"
          onClick={dismissBanner}
          className="flex-none rounded-full bg-white/10 px-3.5 py-1 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/20 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Go to sign in <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="flex flex-1 justify-end">
        <button
          type="button"
          onClick={dismissBanner}
          className="-m-3 p-3 text-slate-100 hover:text-white focus-visible:outline-none"
        >
          <span className="sr-only">Dismiss</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
