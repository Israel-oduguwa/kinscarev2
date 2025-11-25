"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CareerPathHub() {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Responsive, dramatic ribbon-style connector paths (thin, elegant)
  const getRibbonPaths = () => {
    if (typeof window === "undefined") return null;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Mobile (stacked): graceful flowing curve from top card to bottom card
      return {
        ribbon1: "M 40 70 C 120 30, 230 110, 320 200",
        ribbon2: "M 46 76 C 126 36, 236 116, 326 206",
        ribbon3: "M 52 82 C 132 42, 242 122, 332 212",
        viewBox: "0 0 380 260",
      };
    } else {
      // Desktop (side-by-side): more dramatic S-curve (thin, ribbon-like)
      return {
        ribbon1: "M 60 140 C 150 20, 350 20, 440 140",
        ribbon2: "M 66 146 C 156 26, 356 26, 446 146",
        ribbon3: "M 72 152 C 162 32, 362 32, 452 152",
        viewBox: "0 0 520 220",
      };
    }
  };

  const ribbonPaths = getRibbonPaths();

  return (
    <div className="px-4 md:px-6 py-10">
      {/* Header */}
      <div className="relative mx-auto max-w-7xl">
        {/* Top-right utility link */}
        <div className="absolute right-0 -top-2">
          <Link
            href="/referrals"
            className="text-sm font-medium text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            Your referrals
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 p-6 md:p-8 text-white shadow-sm">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Career Paths
          </h1>
          <p className="mt-2 text-white/90 max-w-2xl leading-relaxed">
            Choose where to start. Explore <span className="font-semibold">Programs</span> if you&apos;re
            deciding how to train, or <span className="font-semibold">Careers</span> to see roles,
            pay, and growth—tailored to you.
          </p>
        </div>
      </div>

      {/* Cards + ribbon connector */}
      <div ref={containerRef} className="relative mx-auto mt-8 max-w-7xl">
        {/* Elegant Ribbon Connector (behind cards) */}
        {isMounted && ribbonPaths && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full z-0"
            viewBox={ribbonPaths.viewBox}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* Main ribbon gradient (indigo family) */}
              <linearGradient id="ribbon-main" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7e22ce" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              {/* Ribbon edge highlight */}
              <linearGradient id="ribbon-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.85" />
              </linearGradient>

              {/* Soft drop shadow */}
              <filter id="ribbon-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
                <feOffset in="blur" dx="1.5" dy="1.5" result="offsetBlur" />
                <feMerge>
                  <feMergeNode in="offsetBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Subtle glow for depth */}
              <filter id="ribbon-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="#6366f1" floodOpacity="0.25" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* --- Refined thin ribbon style --- */}
            {/* Shadow base */}
            <path
              d={ribbonPaths.ribbon2}
              fill="none"
              stroke="url(#ribbon-main)"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#ribbon-shadow)"
              opacity="0.22"
            />

            {/* Primary ribbon (thin, elegant) */}
            <path
              d={ribbonPaths.ribbon2}
              fill="none"
              stroke="url(#ribbon-main)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ribbon-glow)"
              opacity="0.95"
            />

            {/* Top highlight for 3D illusion */}
            <path
              d={ribbonPaths.ribbon1}
              fill="none"
              stroke="url(#ribbon-highlight)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />

            {/* Bottom edge shimmer */}
            <path
              d={ribbonPaths.ribbon3}
              fill="none"
              stroke="url(#ribbon-highlight)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />

            {/* Optional: subtle moving sparkles along the path (kept tiny to stay classy) */}
            <path
              d={ribbonPaths.ribbon2}
              fill="none"
              stroke="transparent"
              strokeWidth="10"
              strokeLinecap="round"
              id="sparkle-path"
            />
            <circle r="1.6" fill="#ffffff">
              <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto">
                <mpath href="#sparkle-path" />
              </animateMotion>
              <animate attributeName="opacity" values="0;0.9;0" dur="3.2s" repeatCount="indefinite" />
            </circle>
            <circle r="1.4" fill="#c084fc">
              <animateMotion dur="4.2s" repeatCount="indefinite" rotate="auto" begin="0.8s">
                <mpath href="#sparkle-path" />
              </animateMotion>
              <animate attributeName="opacity" values="0;0.8;0" dur="4.2s" repeatCount="indefinite" />
            </circle>
          </svg>
        )}

        {/* Grid with two option cards */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 relative z-10">
          {/* Explore Programs */}
          <Link
            href="/career-path/programs"
            className="group block transition-transform hover:scale-[1.02]"
          >
            <Card className="rounded-2xl border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 h-full backdrop-blur-sm bg-white/95">
              <CardHeader className="space-y-4 p-6">
                <div className="inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 transition-colors shadow-sm">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                    Programs
                  </span>
                </div>
                <CardTitle className="text-xl md:text-2xl text-gray-900">
                  Explore Programs
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Explore nursing & allied healthcare programs from colleges and universities near you
                  (online, on-campus, or hybrid).
                </CardDescription>
                <Button
                  variant="ghost"
                  className="w-fit px-3 text-purple-700 hover:text-purple-900 group-hover:bg-purple-50 mt-2"
                >
                  Start exploring{" "}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardHeader>
            </Card>
          </Link>

          {/* Explore Careers */}
          <Link
            href="/career-path/careers"
            className="group block transition-transform hover:scale-[1.02]"
          >
            <Card className="rounded-2xl border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 h-full backdrop-blur-sm bg-white/95">
              <CardHeader className="space-y-4 p-6">
                <div className="inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors shadow-sm">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                    Careers
                  </span>
                </div>
                <CardTitle className="text-xl md:text-2xl text-gray-900">
                  Explore Careers
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Discover nursing & allied health careers with wage ranges, growth outlook, and
                  nearby job searches tailored to your location.
                </CardDescription>
                <Button
                  variant="ghost"
                  className="w-fit px-3 text-blue-700 hover:text-blue-900 group-hover:bg-blue-50 mt-2"
                >
                  See roles{" "}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
