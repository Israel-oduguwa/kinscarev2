// app/program-recommendations/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import ProgramRecommendation from '@/Caregivers/Explore/ProgramRecommendation';

export const metadata: Metadata = {
  title: "Personalized Program Recommendations | KinsCare",
  description:
    "Discover tailored college and career program recommendations just for you. Sign up to unlock your personalized pathway and get expert support for your next steps.",
  keywords: [
    "college recommendations",
    "career programs",
    "allied health",
    "personalized education",
    "KinsCare"
  ],
  openGraph: {
    title: "Personalized Program Recommendations | KinsCare",
    description:
      "Explore your best-fit programs based on your interests and goals. KinsCare helps you take the next step in your education and career journey.",
    url: "https://www.kinscare.org/program-recommendations", // update URL as needed
    siteName: "KinsCare",
    images: [
      {
        url: "https://www.kinscare.org/og-program-recommendation.jpg", // replace with your image
        width: 1200,
        height: 630,
        alt: "Personalized program recommendations",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Personalized Program Recommendations | KinsCare",
    description:
      "Discover your recommended programs and unlock your future with KinsCare.",
    images: [
      "https://www.kinscare.org/og-program-recommendation.jpg", // update if needed
    ],
  },
};

function Page() {
  return <div><ProgramRecommendation/></div>;
}

export default Page;
