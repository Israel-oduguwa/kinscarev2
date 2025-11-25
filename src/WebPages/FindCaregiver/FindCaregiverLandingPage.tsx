/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import {
  Check,
  PhoneForwarded,
  Pin,
  Search as SearchIcon,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import SearchBar from "./SearchBar";
import Link from "next/link";

const FindLandingPage = () => {
  return (
    <div className="bg-white text-gray-900 pt-16 sm:pt-16"> {/* Added responsive padding-top to account for fixed/sticky navbar height (assuming ~64px/5rem on small, ~80px on larger; adjust values based on actual navbar height) */}
      {/* ============== HERO ============== */}
      <section
        aria-label="Find caregivers hero"
        className="relative w-full min-h-[600px] pt-10 max-h-[820px] overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1380983332-min.jpg?alt=media&token=5f9db9a8-fe08-40a3-bb3c-cda1feb17bed"
            alt=""
            fill
            className="object-cover object-top pointer-events-none select-none"
            priority
            draggable={false}
          />
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-gray-900/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <h1 className="text-white font-extrabold leading-tight tracking-tight text-4xl sm:text-5xl md:text-6xl">
            Find the{" "}
            <span className="bg-[conic-gradient(var(--tw-gradient-stops))] from-yellow-400 via-red-500 to-pink-500 text-transparent bg-clip-text">
              Perfect Caregiver
            </span>
          </h1>

          <div className="w-full mt-6 max-w-7xl">
            <SearchBar />
          </div>

          <p className="mt-4 py-6 text-base sm:text-lg md:text-xl text-gray-100 font-semibold">
            Over{" "}
            <span className="text-white font-extrabold">30 caregivers</span>{" "}
            join KinsCare every day!
          </p>
        </div>
      </section>

      {/* ============== VALUE BANNER ============== */}
      <section aria-label="KinsCare value banner" className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="relative p-6 md:p-8 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-800 to-blue-900">
            {/* Decorative bubbles */}
            <div className="pointer-events-none absolute -top-6 -right-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />

            <div className="relative flex flex-col md:flex-row items-start gap-6 md:gap-8">
              <div className="min-w-[50px] h-12 flex items-center justify-center p-2 bg-gradient-to-br from-sky-400/20 to-purple-400/20 rounded-xl border border-white/10">
                <Pin size={22} strokeWidth={2.3} className="text-white" />
              </div>

              <p className="flex-1 text-gray-100 text-base md:text-lg leading-relaxed">
                KinsCare is designed to be easy and affordable. Every caregiver
                you find here means{" "}
                <span className="font-bold text-white">
                  better support, less stress, and higher-quality
                </span>{" "}
                care for your residents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== VALUE PROPOSITION ============== */}
      <section aria-labelledby="vp-title" className="bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-10 md:py-14">
          <h2 id="vp-title" className="text-3xl md:text-5xl font-bold mb-5">
            Find Caregivers{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-600">
              Faster
            </span>
            {" & "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-600">
              Easier
            </span>
          </h2>

          <p className="text-gray-700 max-w-3xl mx-auto">
            Finding reliable caregivers is tough—high turnover, last-minute
            gaps, rising demand. KinsCare simplifies this process by connecting
            you directly with caregivers ready to work (full-time, part-time, or
            on-call). Join providers who trust KinsCare for efficient,
            stress-free hiring.
          </p>
        </div>

        {/* Why Use KinsCare */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Visual card */}
            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1336058538-min.jpg?alt=media&token=35eabd18-0e89-470b-a4d5-b8269b91a38c"
                  alt="Caregivers smiling"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <div className="pointer-events-none absolute -bottom-6 -right-6 w-32 h-32 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-30" />
            </div>

            {/* Reasons */}
            <div>
              <div className="inline-flex items-center bg-linear-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 font-semibold rounded-full mb-5">
                <Pin size={16} className="mr-2" />
                <span>Why Use KinsCare?</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    title: "Quick Matching",
                    description: "Search caregivers who meet your needs.",
                    icon: <SearchIcon size={20} className="text-cyan-500" />,
                  },
                  {
                    title: "Direct Contact",
                    description: "Connect instantly after signing up.",
                    icon: (
                      <PhoneForwarded size={20} className="text-purple-500" />
                    ),
                  },
                  {
                    title: "No Middleman",
                    description:
                      "You recruit and hire directly—no agency fees.",
                    icon: <User size={20} className="text-amber-500" />,
                  },
                  {
                    title: "Flexible Hiring",
                    description: "Full-time, part-time, live-in, or on-call.",
                    icon: <Check size={20} className="text-emerald-500" />,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl backdrop-blur-sm bg-white/70 border border-gray-100 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm mr-4">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-base mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== WHY IT MATTERS ============== */}
      <section aria-labelledby="why-title" className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 grid md:grid-cols-1 gap-10">
          <div className="bg-blue-50 p-6 md:p-8 rounded-xl">
            <h3
              id="why-title"
              className="tracking-tight text-2xl md:text-xl font-bold text-gray-800 mb-5"
            >
              Why Finding the Right Caregiver Matters
            </h3>

            <ul className="space-y-4">
              {[
                {
                  title: "The Hiring Challenge",
                  body: "Struggling to find reliable caregivers? High turnover rates make it even harder to maintain consistent care.",
                },
                {
                  title: "The Consequences",
                  body: "When shifts go unfilled, resident care suffers, staff burnout increases, and compliance risks grow—often forcing providers to step in themselves.",
                },
                {
                  title: "The Solution",
                  body: "That’s where KinsCare makes a difference.",
                },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mr-3 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-800">
                    <span className="font-semibold">{item.title}: </span>
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Post your job */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 pb-12">
          <div>
            <h3 className="tracking-tight text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Get More Caregivers by Posting Your Job
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Posting a job on KinsCare makes it even easier to find caregivers.
              Once live, caregivers can apply, share it with colleagues, and
              help spread the word. We also notify our network to boost
              qualified matches—fast. KinsCare keeps hiring simple, affordable,
              and effective so you can focus on excellent care.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1140153601-min.jpg?alt=media&token=93fce255-b7d8-4e0d-a28a-5e089a94d6e7"
              alt="Posting jobs on KinsCare"
              className="w-full h-auto rounded-xl object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ============== TESTIMONIALS ============== */}
      <section aria-labelledby="testimonials-title" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center mb-12">
            <h2
              id="testimonials-title"
              className="text-3xl md:text-5xl font-bold mb-3"
            >
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-pink-500">
                Care Professionals
              </span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Join hundreds of healthcare professionals who’ve transformed their
              hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: "Maria Shevchenko",
                role: "Care Home Manager",
                content:
                  "KinsCare makes finding caregivers easier than ever! I can post openings, get direct applications, and contact caregivers—no more waiting on referrals.",
                initials: "MS",
                color: "from-purple-500 to-indigo-500",
              },
              {
                name: "Solomon Gebremariam",
                role: "Healthcare Recruiter",
                content:
                  "I found qualified local caregivers quickly with KinsCare. It’s simple, effective, and saves me time compared to other hiring methods!",
                initials: "SG",
                color: "from-cyan-500 to-blue-500",
              },
              {
                name: "Alice Kamau",
                role: "Adult Family Home Owner",
                content:
                  "KinsCare is both affordable and flexible. I only pay when I need caregivers, and get direct access to candidates without extra hassle.",
                initials: "AK",
                color: "from-amber-500 to-orange-500",
              },
            ].map((t, i) => (
              <article
                key={i}
                className="p-7 rounded-3xl backdrop-blur-sm bg-white/70 border border-gray-100 shadow-sm hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <header className="flex items-center mb-5">
                  <div
                    className={`w-14 h-14 rounded-full bg-linear-to-r ${t.color} flex items-center justify-center text-white font-bold text-lg mr-4`}
                    aria-hidden
                  >
                    {t.initials}
                  </div>
                  <div>
                    <h3 className="font-bold">{t.name}</h3>
                    <p className="text-gray-600 text-sm">{t.role}</p>
                  </div>
                </header>

                <div className="flex mb-3" aria-hidden>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill="#fbbf24"
                      className="text-amber-400 mr-1"
                    />
                  ))}
                </div>

                <p className="text-gray-700 italic">"{t.content}"</p>
              </article>
            ))}
          </div>

          {/* KPI Banner */}
          <div className="mt-12">
            <div className="relative bg-linear-to-br from-indigo-900 to-blue-800 rounded-2xl p-6 md:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-3 mb-2">
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-sky-500/20 blur-lg"
                        aria-hidden
                      />
                      <span className="text-4xl md:text-6xl font-bold bg-linear-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent relative">
                        200+
                      </span>
                    </div>
                    <svg
                      className="w-8 h-8 text-rose-400 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <p className="text-indigo-100 font-medium">
                    Over 200 providers in the Northwest use KinsCare and the
                    number{" "}
                    <span className="text-emerald-300">
                      keeps growing daily!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section aria-labelledby="how-title" className="bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <header className="text-center mb-8">
            <h2
              id="how-title"
              className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800 mb-2"
            >
              What is the best way to find caregivers?
            </h2>
            <p className="text-gray-600">
              Follow these simple steps to find the most qualified caregivers
              for your needs.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 min-h-64 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-upload"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Post Your Job</h3>
              <p className="text-gray-700">
                Create a detailed job listing. Local caregivers get email and
                text alerts about your opening.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 min-h-64 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-search"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Search for Caregivers
              </h3>
              <p className="text-gray-700">
                Filter by availability (Full-time/Part-time) and licenses
                (CNA/NAC, HCA). View resumes with contact info.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 min-h-64 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 text-purple-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-phone-forwarded"
                  aria-hidden
                >
                  <polyline points="18 2 22 6 18 10" />
                  <line x1="14" x2="22" y1="6" y2="6" />
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Contact & Hire</h3>
              <p className="text-gray-700">
                Review resumes and connect with caregivers directly to finalize
                your hiring process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section aria-label="Primary call to action" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 bg-linear-to-br from-indigo-600 to-purple-700 shadow-2xl text-center">
            {/* floating elems */}
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-linear-to-r from-cyan-400/20 to-blue-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-linear-to-r from-pink-400/20 to-rose-500/20 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Find Your Perfect Caregiver?
              </h2>
              <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-7">
                Join providers who trust KinsCare to find reliable, qualified
                caregivers quickly and easily.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/caregivers?shifts=Full+time&licenses=HCA">
                 <button
                  className="px-8 py-4 rounded-full font-semibold bg-white text-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
                  aria-label="Search caregivers now"
                >
                  Search Caregivers Now
                </button>
                </Link>
               
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FindLandingPage;