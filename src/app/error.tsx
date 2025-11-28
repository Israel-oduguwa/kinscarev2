"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console for quick diagnostics; upstream logging can be added here
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16">
        <div className="flex items-center gap-3">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
            alt="KinsCare"
            width={42}
            height={42}
            className="h-11 w-11"
            priority
          />
          <div>
            <p className="text-sm text-slate-500">KinsCare</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Something went wrong
            </h1>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 px-8 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Error boundary
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              We hit a snag while loading this page
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Please retry. If it keeps happening, contact our team and include any
              steps you took.
            </p>
          </div>

          <div className="px-8 py-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={reset} className="shadow-sm">
                Try again
              </Button>
              <Button asChild variant="secondary">
                <Link href="/">Back home</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:support@kinscare.org?subject=App%20error">
                  Contact support
                </a>
              </Button>
            </div>

            {error?.digest && (
              <p className="mt-4 text-xs text-slate-500">
                Error reference: {error.digest}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
