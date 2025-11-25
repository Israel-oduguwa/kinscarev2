import type { Metadata } from "next";
import All from "@/Caregivers/Jobs/All";

export const metadata: Metadata = {
  title: "Available Caregiver Jobs | KinsCare",
  description:
    "Explore available caregiver jobs, nursing opportunities, and healthcare roles. Find positions that fit your schedule and skills on KinsCare.",
  keywords: [
    "caregiver jobs",
    "healthcare jobs",
    "nursing assistant jobs",
    "home care jobs",
    "CNA jobs",
    "KinsCare jobs",
  ],
  openGraph: {
    title: "Available Caregiver Jobs | KinsCare",
    description:
      "Explore caregiver, nursing, and home health roles. Apply to jobs that match your skills and preferences.",
    url: "https://www.kinscare.org/vitae/jobs/all",
    siteName: "KinsCare",
    images: [
      {
        url: "https://www.kinscare.org/og-caregiver-jobs.png", // use your actual OG image
        width: 1200,
        height: 630,
        alt: "Caregiver Jobs on KinsCare",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@kinscare", // your Twitter handle if you have one
    title: "Available Caregiver Jobs | KinsCare",
    description:
      "Explore caregiver, nursing, and home health roles. Apply to jobs that match your skills and preferences.",
    images: ["https://www.kinscare.org/og-caregiver-jobs.png"],
  },
  alternates: {
    canonical: "https://www.kinscare.org/vitae/jobs/all",
  },
};

function Page() {
  return (
    <div>
      <All />
    </div>
  );
}

export default Page;
