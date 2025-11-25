// app/caregiver-signup/page.tsx (or app/signup/caregiver/page.tsx)
// Purpose: SEO-optimized caregiver signup page using Next.js 15 App Router

import CaregiverSignupPage from "@/Authentication/CaregiverSignupPage";
import type { Metadata } from "next";
import { Suspense } from "react";

// ---- SITE CONSTANTS
const SITE = {
  url: "https://www.kinscare.com",
  brand: "Kinscare",
  signupPath: "/signup/caregivers",
  ogImage:
    "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
};

// ---- METADATA (CAREGIVER-FOCUSED)
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Caregiver Sign Up | Join Kinscare & Find CNA/HHA Jobs Near You",
    template: "%s | Kinscare",
  },
  description:
    "Create your caregiver account to access local CNA/HHA jobs, flexible schedules, and verified families & facilities. Free profile, instant alerts, secure onboarding.",
  keywords: [
    "Caregiver signup",
    "CNA jobs signup",
    "HHA registration",
    "Care aide application",
    "Caregiver jobs near me",
    "Kinscare caregivers",
  ],
  alternates: {
    canonical: `${SITE.url}${SITE.signupPath}`,
    languages: {
      "en-US": `${SITE.url}${SITE.signupPath}`,
      "en-NG": `${SITE.url}${SITE.signupPath}`,
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE.url}${SITE.signupPath}`,
    siteName: SITE.brand,
    title: "Caregiver Sign Up | Join Kinscare & Find CNA/HHA Jobs Near You",
    description:
      "Create a free caregiver profile to get matched with families and healthcare providers. Instant job alerts and secure onboarding.",
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "Kinscare" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caregiver Sign Up | Join Kinscare & Find CNA/HHA Jobs Near You",
    description:
      "Create your caregiver account and start getting job matches today. CNA/HHA friendly.",
    images: [SITE.ogImage],
    creator: "@kinscare",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Helpful for rich-link previews in messaging apps
  other: {
    "theme-color": "#0ea5e9",
  },
};

// ---- JSON-LD SCHEMA
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Caregiver Sign Up",
  description:
    "Create your caregiver (CNA/HHA) account to access local jobs, flexible schedules, and verified families & facilities on Kinscare.",
  url: `${SITE.url}${SITE.signupPath}`,
  publisher: {
    "@type": "Organization",
    name: SITE.brand,
    logo: {
      "@type": "ImageObject",
      url: SITE.ogImage,
      width: 500,
      height: 500,
    },
  },
  potentialAction: {
    "@type": "RegisterAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}${SITE.signupPath}`,
      inLanguage: "en",
    },
    result: {
      "@type": "ProfilePage",
      name: "Caregiver Profile",
    },
  },
};

// Optional FAQ schema to win rich results
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Kinscare free for caregivers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Creating your caregiver profile is free. You can receive job alerts and apply. Some premium features may require a subscription, depending on your region.",
      },
    },
    {
      "@type": "Question",
      name: "What credentials do I need to sign up?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can sign up with your email or Google account. To get verified faster, have your CNA/HHA license (if applicable), government ID, and basic work history ready.",
      },
    },
    {
      "@type": "Question",
      name: "How quickly can I get job matches?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most caregivers start seeing matches within minutes after completing their profile and location preferences. Turn on alerts to be notified instantly.",
      },
    },
    {
      "@type": "Question",
      name: "Do you support part‑time or flexible shifts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Choose your availability (days, nights, weekends) and we’ll match you with roles that fit your schedule.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Caregivers",
      item: `${SITE.url}/caregivers`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Sign Up",
      item: `${SITE.url}${SITE.signupPath}`,
    },
  ],
};

export default function Page() {
  return (
    <>
      {/* Structured data for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="p-6 text-sm">Loading…</div>}>
        <CaregiverSignupPage />
      </Suspense>
    </>
  );
}
