// app/postjob/page.tsx
import type { Metadata } from "next";
import React from "react";
import Navbar from "@/WebPages/Navbar";
import PublicJobPostForm from "@/Providers/Jobs/PublicJobPostForm";
import Footer from "@/WebPages/Footer";

// 1) SEO Metadata
export const metadata: Metadata = {
  title: "Post a Job – KinsCare",
  description:
    "Post a caregiving job and connect with vetted, compassionate caregivers on KinsCare. Fill out your job details and let us match you with the perfect care.",
  openGraph: {
    title: "Post a Job – KinsCare",
    description:
      "Post a caregiving job and connect with vetted, compassionate caregivers on KinsCare. Fill out your job details and let us match you with the perfect care.",
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
    title: "Post a Job – KinsCare",
    description:
      "Post a caregiving job and connect with vetted, compassionate caregivers on KinsCare. Fill out your job details and let us match you with the perfect care.",
    images: ["https://kinscare.org/images/post-job-banner.jpg"],
  },
  alternates: {
    canonical: "https://kinscare.org/post-job",
  },
};

export default function PostJobPage() {
  // 2) JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Post a Job – KinsCare",
    description:
      "Create a caregiving job posting and connect with qualified caregivers through KinsCare’s platform.",
    url: "https://kinscare.org/post-job",
    mainEntity: {
      "@type": "Service",
      name: "Caregiver Job Posting Service",
      description:
        "Submit job details to find professional caregivers for home care, live-in support, and specialized needs.",
      provider: {
        "@type": "Organization",
        name: "KinsCare",
        url: "https://kinscare.org",
      },
    },
    potentialAction: {
      "@type": "CreateAction",
      target: "https://kinscare.org/post-job",
      description: "Submit your caregiving job details to KinsCare.",
      result: {
        "@type": "JobPosting",
        title: "Caregiving Position",
        description: "Your posted job will appear on KinsCare for qualified caregivers to apply.",
      },
    },
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      
       <PublicJobPostForm/>
        {/* …your form or page content here… */}
        <Footer/>
    </>
  );
}
