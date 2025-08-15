"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Rocket, ShieldCheck } from "lucide-react";

type Props = {
  ctaHref?: string;
  forceShow?: boolean;
  hiddenRoutes?: string[];
  delayMs?: number; // wait before showing
  scrollRatioToTrigger?: number; // also show when user scrolls this much (0..1)
  heightPx?: number; // announced bar height for body padding (default 42)
};

const LS = {
  lastShownAt: "kc_js_top_slim_last_shown_at",
  dismissedUntil: "kc_js_top_slim_dismissed_until",
  clickedAt: "kc_js_top_slim_clicked_at",
  impressions: "kc_js_top_slim_impressions",
  sessionShown: "kc_js_top_slim_session_shown",
};

const DAY = 24 * 60 * 60 * 1000;

function track(event: string, props?: Record<string, any>) {
  try {
    (window as any)?.mixpanel?.track?.(event, props);
  } catch {}
}

function now() {
  return Date.now();
}

function getNumber(key: string): number | null {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function setNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

function inc(key: string) {
  try {
    const current = Number(localStorage.getItem(key) || "0");
    localStorage.setItem(key, String(current + 1));
  } catch {}
}

const defaultHiddenRoutes = [
  "/jumpstart",
  "/pricing",
  "/checkout",
  "/login",
  "/register",
  "/admin",
  "/dashboard",
  "/account",
];

export default function JumpstartAnnounceBar({
  ctaHref = "/jumpstart",
  forceShow = false,
  hiddenRoutes = defaultHiddenRoutes,
  delayMs = 15000,
  scrollRatioToTrigger = 0.35,
  heightPx = 42,
}: Props) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [eligible, setEligible] = useState(false);

  // store original body padding to restore later
  const originalBodyPadding = useRef<string | null>(null);
  const isHiddenRoute = useMemo(() => {
    if (!pathname) return false;
    return hiddenRoutes.some((r) => pathname.startsWith(r));
  }, [pathname, hiddenRoutes]);

  // Determine eligibility (freq capping)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isHiddenRoute) return;

    if (forceShow) {
      setEligible(true);
      return;
    }

    // once per session
    try {
      if (sessionStorage.getItem(LS.sessionShown)) return;
    } catch {}

    const t = now();
    const clickedAt = getNumber(LS.clickedAt);
    if (clickedAt && t - clickedAt < 14 * DAY) return;

    const dismissedUntil = getNumber(LS.dismissedUntil);
    if (dismissedUntil && t < dismissedUntil) return;

    const lastShownAt = getNumber(LS.lastShownAt);
    if (lastShownAt && t - lastShownAt < 1 * DAY) return; // 24h cooldown

    setEligible(true);
  }, [forceShow, isHiddenRoute]);

  // Reveal after delay OR scroll
  useEffect(() => {
    if (!eligible || typeof window === "undefined") return;

    let revealed = false;
    const reveal = (reason: "delay" | "scroll") => {
      if (revealed) return;
      revealed = true;

      // apply body padding so navbar shifts down under the banner
      try {
        const body = document.body;
        if (originalBodyPadding.current === null) {
          originalBodyPadding.current = body.style.paddingTop || "";
        }
        body.style.paddingTop = `${heightPx}px`;
      } catch {}

      setVisible(true);
      setNumber(LS.lastShownAt, now());
      try {
        sessionStorage.setItem(LS.sessionShown, "1");
      } catch {}
      inc(LS.impressions);
      track("jumpstart_top_slim_shown", { reason, path: pathname });
    };

    const timer = window.setTimeout(() => reveal("delay"), delayMs);

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
      const docHeight = doc.scrollHeight - doc.clientHeight;
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
      if (ratio >= scrollRatioToTrigger) {
        reveal("scroll");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [eligible, delayMs, scrollRatioToTrigger, pathname, heightPx]);

  // Clean up body padding when unmounting or hiding
  useEffect(() => {
    return () => {
      try {
        if (originalBodyPadding.current !== null) {
          document.body.style.paddingTop = originalBodyPadding.current;
        }
      } catch {}
    };
  }, []);

  if (!visible || isHiddenRoute) return null;

  const closeAndRestore = (snoozeMs: number, evt: "dismiss" | "click") => {
    setVisible(false);
    try {
      if (originalBodyPadding.current !== null) {
        document.body.style.paddingTop = originalBodyPadding.current;
      }
    } catch {}
    if (evt === "dismiss") {
      setNumber(LS.dismissedUntil, now() + snoozeMs);
      track("jumpstart_top_slim_dismissed", { path: pathname });
    } else {
      setNumber(LS.clickedAt, now());
      track("jumpstart_top_slim_cta_clicked", { path: pathname });
    }
  };

  const onDismiss = () => closeAndRestore(7 * DAY, "dismiss");
  const onClick = () => closeAndRestore(14 * DAY, "click");

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      role="region"
      aria-label="Jumpstart Hiring announcement"
      className="fixed top-0 inset-x-0 z-[80]"
      style={{
        // ensure minimal height and safe click targets
        lineHeight: 1.15,
      }}
    >
      <div
        className={[
          "mx-auto max-w-screen-2xl",
          "border-b border-neutral-200/70 dark:border-neutral-800/70",
          "bg-white/90 dark:bg-neutral-900/90",
          "backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/70",
          "shadow-sm",
          reduceMotion ? "" : "transition-transform duration-300 ease-out",
        ].join(" ")}
        style={{
          height: heightPx,
        }}
      >
        {/* hairline gradient */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500" />

        <div className="h-full px-3 sm:px-4">
          <div className="h-full flex items-center justify-between gap-2">
            {/* Left: icon + copy */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/80">
                <Rocket className="h-3.5 w-3.5" aria-hidden />
              </span>
              <p className="truncate text-[13px] sm:text-sm text-neutral-900 dark:text-neutral-100">
                <span className="font-semibold">Jumpstart Hiring:</span>{" "}
                3 caregivers in 3 days — <span className="font-medium">100% guaranteed</span>.
                <span className="ml-1 hidden xs:inline">Includes 2 weeks full access.</span>{" "}
                <span className="font-semibold">$200</span>
              </p>
            </div>

            {/* Middle: quick stats (hide on small) */}
            <div className="hidden md:flex items-center gap-3 text-[12px] text-neutral-600 dark:text-neutral-300">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                98% satisfaction
              </span>
              <span aria-hidden>•</span>
              <span>3,500+ caregivers</span>
              <span aria-hidden>•</span>
              <span>24h avg. first match</span>
            </div>

            {/* Right: CTA + close */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href={ctaHref}
                onClick={onClick}
                className="inline-flex items-center justify-center rounded-md px-2.5 sm:px-3 py-1.5 text-[12px] sm:text-sm font-semibold text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246), rgb(16 185 129))",
                }}
              >
                Get Jumpstart
              </Link>
              <button
                aria-label="Dismiss announcement"
                onClick={onDismiss}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200/70 dark:border-neutral-800/70 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
              >
                <X className="h-4 w-4 text-neutral-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* optional: subtle fade shadow below bar for depth */}
      <div className="pointer-events-none h-2 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5" />
    </div>
  );
}
