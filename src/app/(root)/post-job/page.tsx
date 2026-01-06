// app/postjob/page.tsx
import type { Metadata } from "next";
import React, { Suspense } from "react";
import PublicJobPostForm from "@/Providers/Jobs/PublicJobPostForm";
import { Skeleton } from "@/components/ui/skeleton";
import { CaregiverCardSkeleton } from "@/Providers/Candidates/CandidateSkelenton";

export const metadata: Metadata = {
  title: "Hire a Caregiver Near You – Post a Caregiver Job | KinsCare",
  description:
    "Need a reliable caregiver? Post a caregiver job on KinsCare to reach local, qualified care professionals—CNA, HCA & more. Start free & hire today!",
  openGraph: {
    title: "Hire a Caregiver Near You – Post a Caregiver Job | KinsCare",
    description:
      "Need a reliable caregiver? Post a caregiver job on KinsCare to reach local, qualified care professionals—CNA, HCA & more. Start free & hire today!",
    url: "https://kinscare.org/post-job",
    images: [
      {
        url: "https://kinscare.org/images/post-job-banner.jpg",
        alt: "Post a Job on KinsCare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire a Caregiver Near You – Post a Caregiver Job | KinsCare",
    description:
      "Need a reliable caregiver? Post a caregiver job on KinsCare to reach local, qualified care professionals—CNA, HCA & more. Start free & hire today!",
    images: ["https://kinscare.org/images/post-job-banner.jpg"],
  },
  alternates: {
    canonical: "https://kinscare.org/post-job",
  },
};

export default function PostJobPage() {
  // Enhanced JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Hire a Caregiver Near You – Post a Caregiver Job | KinsCare",
    description:
      "Find and hire reliable caregivers in your area. Post a job to connect with qualified CNAs, HCAs, and local care professionals—fast and hassle-free.",
    url: "https://kinscare.org/post-job",
    keywords:
      "caregiver jobs, post caregiver job, hire a caregiver, CNA, HCA, home care, local caregivers",
    mainEntity: {
      "@type": "Service",
      name: "Caregiver Job Posting Service",
      description:
        "Submit your care job—KinsCare matches you with licensed caregivers, companions, and professionals ready to work in your area.",
      provider: {
        "@type": "Organization",
        name: "KinsCare",
        url: "https://kinscare.org",
        sameAs: [
          "https://www.facebook.com/kinscare",
          "https://www.linkedin.com/company/kinscare",
        ],
      },
    },
    potentialAction: {
      "@type": "CreateAction",
      target: "https://kinscare.org/post-job",
      description:
        "Post your care job and start receiving caregiver applications within hours.",
      result: {
        "@type": "JobPosting",
        title: "Caregiving Job Opportunity",
        description:
          "Your posted job will be seen by qualified, local caregivers on KinsCare.",
      },
    },
  };

  return (
    <>
       <Suspense
            fallback={
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 py-10 mt-10  gap-6">
                  <Skeleton className="w-full h-40 " />
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <CaregiverCardSkeleton key={idx} />
                  ))}
                </div>
              </div>
            }
          >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative bg-slate-950/5 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(59,130,246,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_20%,rgba(30,64,175,0.12),transparent_60%)]" />
          <div className="absolute -top-24 right-6 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:36px_36px] opacity-30" />
        </div>
        {/* In-page value proposition/banner for conversion */}
        <div className="relative max-w-7xl mt-0 md:mt-10 lg:mt-16 mx-auto py-24 px-0  md:px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form Column (spans 2/3 width) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="mb-6 px-4 md:px-0">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Post a job
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-[family:var(--header-font)] font-extrabold text-slate-900">
                Hire a Caregiver—Fast, Easy & Local
              </h1>
              <p className="text-slate-600 mt-2">
                Post your job to reach certified caregivers, CNAs, and HCAs
                actively seeking work.
              </p>
              <div className="flex gap-2 mt-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full">
                  Trusted by 200+ Providers
                </span>

                <span className="flex items-center bg-white/80 text-slate-700 text-xs font-medium px-3 py-1 rounded-full gap-2 border border-white/70 shadow-sm">
                  <svg
                    className="w-4 h-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Real Caregivers
                </span>
              </div>
            </div>
            <PublicJobPostForm />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 px-4 md:px-0 xl:col-span-4 space-y-8">
            {/* How It Works */}
            <div className="bg-white/80 rounded-3xl shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)] border border-white/70 backdrop-blur overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  How Posting Works
                </h2>
                <ol className="list-decimal ml-5 text-slate-600 text-sm space-y-1">
                  <li>Share your job details—takes 2 minutes</li>
                  <li>Get matched with local, qualified caregivers</li>
                  <li>Contact & hire your best fit directly</li>
                </ol>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white/80 rounded-3xl shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)] border border-white/70 backdrop-blur overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  Why Providers Choose Us
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {[
                    "Pay only when you hire - no subscriptions",
                    "Connect with caregivers ready to start immediately",
                    "Full access to verified profiles and resumes",
                    "Dedicated support team - real humans only",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white/80 rounded-3xl shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)] border border-white/70 backdrop-blur overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Real Provider Stories
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {[
                    {
                      quote:
                        "Kinscare is both affordable and flexible. I only pay when I need caregivers, and get direct access to candidates without extra hassle.",
                      author: "Alice Kamau",
                      role: "Adult Family Home Owner",
                    },
                    {
                      quote:
                        "Kinscare makes finding caregivers easier than WhatsApp! I can post openings, get direct applications, and contact caregivers—no more waiting on referrals.",
                      author: "Maria Shevchenko",
                      role: "Care Home Manager",
                    },
                  ].map((testimonial, index) => (
                    <div
                      key={index}
                      className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200"
                    >
                      <p className="text-slate-700 italic mb-3">
                        &quot;{testimonial.quote}&quot;
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-slate-500">
                        {testimonial.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            {/* <div className="text-center">
              <a
                href="/help"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
              >
                How does KinsCare match caregivers?
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
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
              </a>
            </div> */}
          </div>
        </div>
      </main>
      </Suspense>
    </>
  );
}
