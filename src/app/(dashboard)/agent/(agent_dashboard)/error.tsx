"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AgentError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Agent dashboard error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900">
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
            <p className="text-sm text-slate-500">Agent dashboard</p>
            <h1 className="text-xl font-semibold text-slate-900">
              We could not load this view
            </h1>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 px-8 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Recovery mode
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Let&apos;s refresh your workspace
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Try again below. If the issue persists, head back to the dashboard or contact
              our team.
            </p>
          </div>

          <div className="px-8 py-6 flex flex-wrap gap-3">
            <Button onClick={reset} className="shadow-sm">
              Retry this page
            </Button>
            <Button asChild variant="secondary">
              <Link href="/agent">Go to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:support@kinscare.org?subject=Agent%20dashboard%20error">
                Contact support
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/agent/twilio">Open Twilio pipeline</Link>
            </Button>
          </div>

          {error?.digest && (
            <div className="px-8 pb-6 text-xs text-slate-500">
              Error reference: {error.digest}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
