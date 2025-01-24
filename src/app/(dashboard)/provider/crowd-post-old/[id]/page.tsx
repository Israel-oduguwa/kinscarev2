import React, { Suspense } from "react";
import CrowdPostJob from "@/Caregivers/Jobs/CrowdPostJob";
import { Metadata } from "next";
import ProviderJobSkeleton from "@/Providers/Jobs/ProviderJobSkelenton";

export const metadata: Metadata = {
  title: "Job Details - Your Company Name",
  description: "View the details of the job posted by the provider. Get all necessary information and manage applications efficiently.",
  openGraph: {
    title: "Job Details - Your Company Name",
    description: "Discover the job details provided by the employer. Learn more about this opportunity.",
    url: "https://yourwebsite.com/provider/job", // Replace with the dynamic URL
    type: "website",
    images: [
      {
        url: "https://yourwebsite.com/assets/images/job-detail-og.jpg", // Replace with an appropriate image URL
        width: 1200,
        height: 630,
        alt: "Job Details Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Job Details - Your Company Name",
    description: "Explore the details of this job opportunity.",
    images: ["https://yourwebsite.com/assets/images/job-detail-twitter.jpg"], // Replace with a Twitter-optimized image URL
  },
};

async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <Suspense fallback={<ProviderJobSkeleton/>}>
      <div className="min-h-full bg-gray-100">
        <CrowdPostJob jobID={id} isProvider={true} />
      </div>
    </Suspense>
  );
}

export default page;