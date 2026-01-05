"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

const DISMISS_KEY = "provider_post_job_banner_dismissed_until";
const DISMISS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export default function ProviderPostJobBanner() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(DISMISS_KEY);
    const until = raw ? Number(raw) : 0;
    if (Number.isFinite(until) && until > Date.now()) {
      setVisible(false);
    }
  }, []);

  const dismissForNow = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + DISMISS_WINDOW_MS)
      );
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
   
      <div className="rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-600/90 to-indigo-800/90 text-white shadow-lg shadow-indigo-500/20">
        <div className="flex flex-col gap-3 px-4 py-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className=" rounded-full bg-white/15 p-2">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <Link href="/provider/job/update/new" onClick={dismissForNow}>
                <p className="text-sm font-semibold">
                  Post your caregiver opening, and connect with local caregivers who match your needs
                </p>
              </Link>
              {/* <p className="text-xs text-white/80">
                Share your role to reach available caregivers and NACs in your area.
              </p> */}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Link href="/provider/job/update/new">
              <Button
                variant="secondary"
                size="sm"
                className="text-indigo-700"
                onClick={dismissForNow}
              >
                Post a job
              </Button>
            </Link>
            <button
              type="button"
              onClick={dismissForNow}
              className="text-white/80 hover:text-white focus-visible:outline-none p-2"
              aria-label="Dismiss banner"
            >
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
      </div>
   
  );
}
