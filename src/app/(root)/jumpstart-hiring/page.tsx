// app/jumpstart-hiring/page.tsx
import type { Metadata } from "next";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HomePage from "@/JumpStartHiring/HomePage";

// -- SEO Metadata --
export const metadata: Metadata = {
  title: "Jumpstart Hiring Service – Fast Caregiver Match | KinsCare",
  description:
    "Let KinsCare's Jumpstart Hiring Service find and schedule interviews with 3 qualified caregivers for you—plus 2 weeks of full access to our caregiver directory. Pay once, hire fast.",
  openGraph: {
    title: "Jumpstart Hiring Service – Fast Caregiver Match | KinsCare",
    description:
      "Let KinsCare's Jumpstart Hiring Service find and schedule interviews with 3 qualified caregivers for you—plus 2 weeks of full access to our caregiver directory. Pay once, hire fast.",
    url: "https://kinscare.org/jumpstart-hiring",
    images: [
      {
        url: "https://kinscare.org/images/jumpstart-hero.jpg",
        alt: "Jumpstart Hiring Service by KinsCare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jumpstart Hiring Service – Fast Caregiver Match | KinsCare",
    description:
      "Let KinsCare's Jumpstart Hiring Service find and schedule interviews with 3 qualified caregivers for you—plus 2 weeks of full access to our caregiver directory. Pay once, hire fast.",
    images: ["https://kinscare.org/images/jumpstart-hero.jpg"],
  },
  alternates: {
    canonical: "https://kinscare.org/jumpstart-hiring",
  },
};

// -- JSON-LD Structured Data --
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Jumpstart Hiring Service",
  description:
    "A premium caregiver matchmaking service by KinsCare. Pay $175 and a KinsCare agent will find and schedule interviews with 3 qualified caregivers in 3 days, plus 2 weeks of unlimited platform access.",
  provider: {
    "@type": "Organization",
    name: "KinsCare",
    url: "https://kinscare.org",
    logo: "https://kinscare.org/logo.svg",
  },
  areaServed: "United States",
  offers: {
    "@type": "Offer",
    price: "200",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  url: "https://kinscare.org/jumpstart-hiring",
};

export default function JumpstartHiringPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
     
    <HomePage/>
    </>
  );
}
