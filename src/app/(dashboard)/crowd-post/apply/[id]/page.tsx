import React, { Suspense } from "react";
import CrowdPostJob from "@/Caregivers/Jobs/CrowdPostJob";
import { Metadata } from "next";
import ProviderJobSkeleton from "@/Providers/Jobs/ProviderJobSkelenton";
import { EmployerAppSidebar } from "@/components/ui/employer-sidebar";
import ApplyCrowdPostJob from "@/Caregivers/Jobs/CrowdPosting/ApplyCrowdPostJob";

export const metadata: Metadata = {
  title: "Apply for this Job – KinsCare",
  description:
    "Ready to take the next step in your caregiving career? Apply for this job opportunity directly through KinsCare. See requirements, employer details, and submit your application instantly.",
  openGraph: {
    title: "Apply for this Job – KinsCare",
    description:
      "Interested in this opportunity? Apply now for this caregiving job on KinsCare and connect with trusted employers. Get details, requirements, and next steps all in one place.",
    url: "https://kinscare.org/apply/job", // You can dynamically add the job ID if needed
    type: "website",
    images: [
      {
        url: "https://kinscare.org/assets/images/job-apply-og.jpg", // Replace with actual job apply image
        width: 1200,
        height: 630,
        alt: "Apply for this Caregiving Job",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apply for this Job – KinsCare",
    description:
      "Start your application for this caregiving position on KinsCare. Get all the details and connect with employers today.",
    images: ["https://kinscare.org/assets/images/job-apply-twitter.jpg"], // Replace with actual Twitter-optimized image
  },
};

async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <Suspense fallback={<ProviderJobSkeleton />}>
      <div className="min-h-full bg-gray-100">
        <ApplyCrowdPostJob jobID={id} />
      </div>
    </Suspense>
  );
}

export default page;
