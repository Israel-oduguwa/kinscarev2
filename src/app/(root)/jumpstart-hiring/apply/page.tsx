import { Skeleton } from "@/components/ui/skeleton";
import HiringChat from "@/JumpStartHiring/HiringChat";
import JumpStartForm from "@/JumpStartHiring/JumpStartForm";
import { CaregiverCardSkeleton } from "@/Providers/Candidates/CandidateSkelenton";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Jumpstart Hiring – Find Trusted Caregivers Fast | KinsCare",
  description:
    "Jumpstart your caregiver hiring with KinsCare. Fill out our quick form, get matched with top caregivers, and hire with confidence – risk-free.",
  keywords: [
    "caregiver hiring",
    "find caregivers",
    "KinsCare jumpstart",
    "caregiver matching service",
    "hire a caregiver",
    "jumpstart hiring program",
  ],
  alternates: {
    canonical: "https://www.kinscare.org/provider/jumpstart",
  },
  openGraph: {
    title: "Jumpstart Hiring – Find Trusted Caregivers Fast | KinsCare",
    description:
      "Get matched with vetted caregivers in just days. KinsCare Jumpstart Hiring makes finding the right caregiver simple and fast.",
    url: "https://www.kinscare.org/provider/jumpstart",
    siteName: "KinsCare",
    images: [
      {
        url: "https://www.kinscare.org/images/jumpstart-og.jpg",
        width: 1200,
        height: 630,
        alt: "KinsCare Jumpstart Hiring – Find Trusted Caregivers",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

function page() {
  return (
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
      <section className="relative min-h-screen bg-linear-to-br from-gray-50 to-indigo-50 py-12 md:py-20 overflow-hidden">
        {/* Decorative SVG blobs */}
        <svg
          className="absolute -top-28 -left-32 w-[400px] h-[400px] opacity-30 z-0 pointer-events-none"
          viewBox="0 0 400 400"
          fill="none"
        >
          <defs>
            <radialGradient id="jumpgrad1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="200" cy="200" rx="200" ry="200" fill="url(#jumpgrad1)" />
        </svg>
        <svg
          className="absolute bottom-0 right-0 w-[350px] h-[350px] opacity-20 z-0 pointer-events-none"
          viewBox="0 0 350 350"
          fill="none"
        >
          <defs>
            <radialGradient id="jumpgrad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="175" cy="175" rx="175" ry="175" fill="url(#jumpgrad2)" />
        </svg>
        <div className="max-w-screen-2xl py-16 xl:py-6 mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT: Form (8 or 9 columns) */}
            <div className="lg:col-span-8 xl:col-span-8 flex flex-col justify-center">
              <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 text-left">
                  Jump start Hiring
                </h1>
                <p className="text-gray-600 mb-3 text-left">
                  Welcome! This is your first step to finding the best caregiver
                  for your needs.
                  <br />
                  Just fill in a few details—our team will take it from here.
                </p>
                <JumpStartForm />
              </div>
            </div>
            {/* RIGHT: Guidance & Persuasion (3 or 4 columns) */}
            <aside className="lg:col-span-4 xl:col-span-4 flex flex-col gap-8 ">
              {/* How it Works */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-lg p-7 flex flex-col gap-5">
                <h2 className="text-xl font-bold text-indigo-900 mb-2">
                  How Jump start Works
                </h2>
                <ol className="list-decimal list-inside space-y-3 text-left text-gray-700">
                  <li>
                    <b>Fill the form:</b> Tell us your requirements.
                  </li>
                  <li>
                    <b>Matching:</b> Our hiring team will shortlist 2–3
                    caregivers.
                  </li>
                  <li>
                    <b>Meet your matches:</b> Interview them at your convenience
                    (in-person or virtual).
                  </li>
                  <li>
                    <b>Decide:</b> If you hire, great! If not, you get 2 weeks’
                    access to our caregiver database—risk-free.
                  </li>
                </ol>
              </div>
              {/* What to Expect */}
              <div className="bg-indigo-600/90 backdrop-blur-xl rounded-3xl shadow-lg p-7 text-white flex flex-col gap-3 border border-white/30">
                <h3 className="text-lg font-semibold mb-1">
                  What Happens After?
                </h3>
                <ul className="space-y-2 text-indigo-100 text-base list-disc list-inside">
                  <li>
                    You’ll receive a call or email from a KinsCare agent within
                    12 hours.
                  </li>
                  <li>We help schedule interviews—on your terms.</li>
                  <li>No obligations or hidden fees.</li>
                </ul>
              </div>
              {/* Need Help */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg p-6">
                <h4 className="text-base font-bold text-gray-700 mb-2">
                  New here? Need help?
                </h4>
                <p className="text-sm text-gray-500 mb-2">
                  Our advisors are happy to answer any questions.
                </p>
                <HiringChat />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Suspense>
  );
}

export default page;
