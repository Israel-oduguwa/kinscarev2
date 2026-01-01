/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useInView, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import JumpstartDialog from "./JumpStartForm";

function HomePage() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const refs = {
    hero: useRef(null),
    howItWorks: useRef(null),
    trust: useRef(null),
    cta: useRef(null),
    faq: useRef(null),
  };

  const controls = {
    hero: useAnimation(),
    howItWorks: useAnimation(),
    trust: useAnimation(),
    cta: useAnimation(),
    faq: useAnimation(),
  };

  // Set up inView observers for each section
  useEffect(() => {
    Object.entries(refs).forEach(([section, ref]) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            controls[section as keyof typeof controls].start("visible");
          }
        },
        { threshold: 0.1 }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    });
  }, []);

  const toggleQuestion = (index: any) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  // Animation variants
  const floatVariants = {
    float1: {
      y: [0, -20, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    float2: {
      y: [0, 25, 0],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    float3: {
      x: [0, 20, 0],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="overflow-hidden">
      {/* Enhanced Hero Section */}
      <section
        ref={refs.hero}
         className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-10 md:py-10 overflow-hidden"
      >
        {/* Dynamic floating blobs */}
        <motion.div
          className="absolute top-[1%] left-[5%] w-96 h-96 bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] rounded-full opacity-20 blur-[120px]"
          variants={floatVariants}
          animate="float1"
        />
        <motion.div
          className="absolute top-1/4 right-[10%] w-80 h-80 bg-gradient-to-r from-[#4776E6] to-[#8E54E9] rounded-full opacity-25 blur-[70px]"
          variants={floatVariants}
          animate="float2"
        />
        <motion.div
          className="absolute bottom-1/3 left-[10%] w-72 h-72 bg-gradient-to-r from-[#654ea3] to-[#da98b4] rounded-full opacity-20 blur-[140px]"
          variants={floatVariants}
          animate="float3"
        />

        {/* Glass morphism grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-1 w-full h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-white/5 rounded-sm" />
            ))}
          </div>
        </div>

        <div className="max-w-8xl mx-auto px-4 md:px-8 text-center relative z-10 pt-30">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block rounded-2xl bg-white/10 backdrop-blur-xl p-3 shadow-lg mb-8 border border-white/10"
          >
            <span className="inline-flex items-center text-slate-100 font-bold gap-2 text-sm md:text-base tracking-wider">
              <svg
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" fill="#3B82F6" />
                <path
                  d="M8 12.5L11 15.5L16 9.5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              New! Jumpstart Hiring
            </span>
          </motion.div>

          {/* Animated headline */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={controls.hero}
            className="mb-8 md:mb-12"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-[family:var(--header-font)] font-extrabold text-white mb-6 leading-tight tracking-tighter">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {"Hire Great Caregivers".split(" ").map((word, i) => (
                  <motion.span key={i} variants={item} className="inline-block">
                    {word}
                  </motion.span>
                ))}
              </div>
              <div className="mt-2 md:mt-4">
                <motion.span
                  variants={item}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-blue-300"
                >
                  Fast
                </motion.span>
                <motion.span variants={item} className="text-white mx-2">
                  —
                </motion.span>
                <motion.span
                  variants={item}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-slate-200"
                >
                  Guaranteed
                </motion.span>
              </div>
            </h1>
          </motion.div>

          {/* Enhanced description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-4xl mx-auto text-lg md:text-xl text-white/80 mb-12"
          >
            Get matched with{" "}
            <span className="font-bold text-sky-200 bg-white/10 px-2 py-1 rounded-md">
              3 qualified caregivers
            </span>
            —personally found and scheduled for you by our team, in just 3 days.
            Plus, enjoy{" "}
            <span className="font-bold text-slate-100 bg-white/10 px-2 py-1 rounded-md">
              2 weeks of full access
            </span>{" "}
            to browse and hire as many as you need. All for{" "}
            <span className="font-bold text-sky-200 bg-white/10 px-2 py-1 rounded-md">
              $175
            </span>
            .
          </motion.p>

          {/* Enhanced CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Link href="/jumpstart-hiring/apply">
              <Button
                size="lg"
                className={cn(
                  "bg-blue-600 text-white text-base md:text-lg font-bold",
                  "px-16 py-8 rounded-xl transform transition-all duration-300",
                  "hover:bg-blue-700 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/30",
                  "relative overflow-hidden group"
                )}
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
        
          </motion.div>

          {/* Enhanced trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center bg-white/10 text-white px-4 py-3 text-sm rounded-full font-medium backdrop-blur-sm border border-white/10">
              <svg
                className="w-5 h-5 mr-2 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              100% Money-Back Guarantee
            </div>
            <div className="inline-flex items-center bg-white/10 text-white px-4 py-3 text-sm rounded-full font-medium backdrop-blur-sm border border-white/10">
              <svg
                className="w-5 h-5 mr-2 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              3 Caregivers in 3 Days – Guaranteed
            </div>
          </motion.div>
          <div className="relative">
            {/* Floating elements around caregiver */}
            <motion.div
              className="absolute top-8 left-0 w-16 h-16 rounded-full bg-gradient-to-r from-sky-400/60 to-blue-500/60 shadow-lg"
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-4 right-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-400/60 to-slate-400/60 shadow-lg"
              animate={{
                y: [0, 15, 0],
                x: [0, -15, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-16 left-1/4 w-10 h-10 rounded-full bg-gradient-to-r from-sky-400/60 to-blue-500/60 shadow-lg"
              animate={{
                y: [0, -15, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          {/* Stats section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: "98%", label: "Satisfaction Rate" },
              { value: "3,500+", label: "Caregivers" },
              { value: "24h", label: "Avg. First Match" },
              { value: "200+", label: "Daily Hires" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating caregiver illustration - Improved version */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[200px] md:h-[300px]"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* <div className="absolute inset-x-0 bottom-0 h-[150px]  to-transparent z-10"></div> */}
        </motion.div>
      </section>

      {/* How It Works */}
      <section
        ref={refs.howItWorks}
        id="how-it-works"
        className="py-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden"
      >
        {/* Decorative Waves */}
        <div className="absolute top-0 left-0 w-full h-20 -mt-20 overflow-hidden">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-[200%] h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDBweCIgdmlld0JveD0iMCAwIDEyODAgMTQwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGZpbGw9IiNmZmYiPjxwYXRoIGQ9Ik0xMjgwIDE0MFYxMy4zQzExNTggMTggMTA5NCAyMSA5NjAgMjFTNzYyIDE4IDY0MCAxMy4zIDMxOCAyMSAxNjAgMjEgMCAxMy4zVjE0MGgxMjgweiIgZmlsbC1vcGFjaXR5PSIuMyIvPjxwYXRoIGQ9Ik0xMjgwIDE0MFYyNi43QzExNTggMzYgMTA5NCA0MCA5NjAgNDBTNzYyIDM2IDY0MCAyNi43QzMxOCAxNy41IDE2MCA0MCAwIDI2LjdWMTAwaDEyODB6IiBmaWxsLW9wYWNpdHk9Ii41Ii8+PHBhdGggZD0iTTAgMGgxMjgwdjEwMEgweiIvPjwvZz48L3N2Zz4=')]"></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-[family:var(--header-font)] font-extrabold text-slate-900 mb-4 mt-3">
              How <span className="text-blue-600">Jumpstart Hiring</span> Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our streamlined process gets you qualified caregivers faster than
              ever
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Pay once—get full support",
                description:
                  "Make a one-time payment of $175. No subscriptions, no hidden fees.",
                icon: (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
              {
                step: 2,
                title: "Tell us who you need",
                description:
                  "Fill a short onboarding form—let us know your requirements, schedule, and preferences.",
                icon: (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                ),
              },
              {
                step: 3,
                title: "We search and schedule for you",
                description:
                  "A real KinsCare agent finds 3 qualified caregivers who match your needs.",
                icon: (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ),
              },
              {
                step: 4,
                title: "Enjoy full access to KinsCare",
                description:
                  "You'll get 2 weeks unlimited access to browse and hire additional caregivers.",
                icon: (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white/80 border border-white/70 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden backdrop-blur"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 mr-4 group-hover:bg-blue-200 transition-colors">
                    {item.step}
                  </div>
                  <div className="text-blue-600 group-hover:text-blue-800 transition-colors">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee - Modern Design */}
      <section
        ref={refs.trust}
        className="py-20 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Trust & guarantee
            </p>
            <motion.h2
              variants={fadeIn}
              initial="hidden"
              animate={controls.trust}
              className="text-3xl md:text-4xl font-[family:var(--header-font)] font-extrabold text-slate-900 mb-4"
            >
              Why Providers Trust KinsCare
            </motion.h2>
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate={controls.trust}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Our commitment to quality and satisfaction is unmatched
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate={controls.trust}
              className="bg-white/80 rounded-3xl p-8 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] border border-white/70 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] transition-shadow duration-300 backdrop-blur"
            >
              <div className="flex items-start mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-emerald-700">
                  100% Satisfaction Guarantee
                </h3>
              </div>
              <p className="text-slate-600">
                If we don't deliver 3 caregivers ready to interview within 3
                business days, your payment is refunded—no questions asked.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate={controls.trust}
              transition={{ delay: 0.1 }}
              className="bg-white/80 rounded-3xl p-8 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] border border-white/70 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] transition-shadow duration-300 backdrop-blur"
            >
              <div className="flex items-start mb-4">
                <div className="bg-sky-100 p-3 rounded-lg mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-blue-700">
                  Personal, Human Service
                </h3>
              </div>
              <p className="text-slate-600">
                We believe in a personal touch. A dedicated member of our team
                will be available to partner with you, ensuring you find the
                right caregiver solution together.
              </p>
            </motion.div>
          </div>

          {/* <motion.div
            variants={fadeIn}
            initial="hidden"
            animate={controls.trust}
            transition={{ delay: 0.2 }}
            className="mt-16 bg-gradient-to-r from-sky-50 to-blue-50 border border-blue-100 rounded-2xl p-8 max-w-4xl mx-auto shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                <div className="bg-gradient-to-br from-sky-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center shadow-inner">
                  <svg
                    className="w-16 h-16 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Quality You Can Trust
                </h3>
                <p className="text-gray-700 mb-4">
                  Every caregiver in our network undergoes a rigorous 5-step
                  vetting process including background checks, reference
                  verification, and skills assessment.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {[
                    "Background Check",
                    "Reference Verification",
                    "Skills Assessment",
                    "Certification Check",
                    "Interview Process",
                  ].map((item, index) => (
                    <span
                      key={index}
                      className="bg-white px-3 py-1 rounded-full text-sm font-medium text-blue-700 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div> */}
        </div>

        {/* Background elements */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full opacity-40 blur-[100px]"></div>
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-to-r from-blue-100 to-slate-100 rounded-full opacity-40 blur-[80px]"></div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-blue-900 to-sky-800 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjMsMyIvPjwvc3ZnPg==')] w-full h-full"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-[family:var(--header-font)] font-extrabold mb-6">
            Ready to Hire the <span className="text-sky-200">Easy Way</span>?
          </h2>
          <p className="text-lg md:text-xl text-slate-100 max-w-2xl mx-auto mb-10">
            Save time, reduce stress, and hire your next caregiver with full
            confidence. Jumpstart Hiring is the fastest, most reliable way to
            build your caregiving team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/jumpstart-hiring/apply">
              <Button
                size="lg"
                className="bg-white text-blue-700 text-lg font-bold px-10 py-5 rounded-xl shadow-lg hover:bg-slate-100 transform transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden"
              >
                <span className="relative z-10">Book Now – $175</span>
                <span className="absolute inset-0 bg-gradient-to-r from-slate-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </Button>
            </Link>
            {/* <Link href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white bg-transparent hover:bg-white/10 px-8 py-5 rounded-xl font-semibold group"
              >
                <span className="flex items-center gap-2">
                  Learn More
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </Button>
            </Link> */}
          </div>
        </div>
      </section>

      {/* FAQ Section - Modern Design */}
      <section
        ref={refs.faq}
        className="py-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              FAQ
            </p>
            <motion.h2
              variants={fadeIn}
              initial="hidden"
              animate={controls.faq}
              className="text-3xl md:text-4xl font-[family:var(--header-font)] font-extrabold text-slate-900 mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate={controls.faq}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-xl mx-auto"
            >
              Everything you need to know about our Jumpstart Hiring service
            </motion.p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate={controls.faq}
            className="space-y-4"
          >
            {[
              {
                question: "What if I don't hire any of the 3 caregivers?",
                answer:
                  "You still get 2 weeks full access to all caregivers on KinsCare. If none of the 3 matches are a fit, we'll help you keep searching—or refund your payment.",
              },
              {
                question: "Are the interviews online or in-person?",
                answer:
                  "Your KinsCare agent will schedule based on your and the caregiver's preference—either virtual (phone/Zoom) or in-person.",
              },
              {
                question: "How fast will I get matched?",
                answer:
                  "You'll have interviews with 3 pre-screened caregivers within 3 business days of submitting your hiring criteria and payment.",
              },
              {
                question: "How do I get started?",
                answer:
                  "Just click 'Book Now,' pay the $175 fee, and complete the intake form. Your KinsCare agent will reach out to confirm your needs.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={item}
                className="border border-white/70 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-200 bg-white/80 backdrop-blur"
              >
                <button
                  className="flex items-center justify-between w-full p-6 text-left bg-white/70 hover:bg-blue-50/60 transition-colors"
                  onClick={() => toggleQuestion(index)}
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {item.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-blue-600 transform transition-transform ${
                      activeQuestion === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    activeQuestion === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-slate-600">{item.answer}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate={controls.faq}
            className="mt-16 text-center"
          >
            <p className="text-slate-700 mb-6">
              Still have questions? Our team is here to help.
            </p>
            <Link href="/contact">
              <Button
                variant="outline"
                className="text-blue-700 border-blue-200 hover:border-blue-400 bg-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-50"
              >
                Contact Support
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Background elements */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full opacity-35 blur-[100px]"></div>
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-gradient-to-r from-blue-100 to-slate-100 rounded-full opacity-40 blur-[80px]"></div>
      </section>
    </div>
  );
}

export default HomePage;
