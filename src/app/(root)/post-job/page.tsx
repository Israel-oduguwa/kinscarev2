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
              <div className="max-w-6xl mx-auto">
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
      <main className="bg-gray-50">
        {/* In-page value proposition/banner for conversion */}
        <div className=" max-w-screen-xl mx-auto py-24 px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form Column (spans 2/3 width) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">
                Hire a Caregiver—Fast, Easy & Local
              </h1>
              <p className=" text-gray-600 mt-2">
                Post your job to reach certified caregivers, CNAs, and HCAs
                actively seeking work.
              </p>
              <div className="flex gap-2 mt-4">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                  Trusted by 200+ Providers
                </span>

                <span className="flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full gap-2">
                  <svg
                    className="w-4 h-4 text-gray-500"
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
          <div className="lg:col-span-4 xl:col-span-4 space-y-8">
            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">
                  How Posting Works
                </h2>
                <ol className="list-decimal ml-5 text-gray-600 text-sm space-y-1">
                  <li>Share your job details—takes 2 minutes</li>
                  <li>Get matched with local, qualified caregivers</li>
                  <li>Contact & hire your best fit directly</li>
                </ol>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-4">
                <h2 className=" font-bold text-white flex items-center gap-2">
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
                        className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
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
                      className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200"
                    >
                      <p className="text-gray-700 italic mb-3">
                        &quot;{testimonial.quote}&quot;
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-gray-500">
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
