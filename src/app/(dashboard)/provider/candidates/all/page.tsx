import React from "react";
import All from "@/Providers/Candidates/All";
import { Metadata } from "next";

// Generate Metadata for SEO and Open Graph
export const metadata: Metadata = {
  title: "Find Professional Caregivers - Search and Connect",
  description:
    "Explore our curated list of caregivers, filter by skills, availability, and location to find the perfect match. Start your caregiver search today!",
  openGraph: {
    title: "Find Professional Caregivers - Search and Connect",
    description:
      "Browse through a wide range of professional caregivers. Use filters to search by availability, skills, and location. Discover and hire your ideal caregiver now.",
    url: "http://yourwebsite.com/caregivers",
    type: "website",
    images: [
      {
        url: "http://yourwebsite.com/images/caregiver-og-image.jpg", // Replace with your image URL
        width: 1200,
        height: 630,
        alt: "Caregiver Search and Connect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Professional Caregivers - Search and Connect",
    description:
      "Browse through professional caregivers. Use filters to search by availability, skills, and location. Hire the best caregiver now.",
    images: ["http://yourwebsite.com/images/caregiver-twitter-image.jpg"], // Replace with your image URL
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
