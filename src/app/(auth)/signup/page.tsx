import React from "react";
import Signup from "@/Authentication/Signup";
import { Metadata } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Define Metadata for SEO
export const metadata: Metadata = {
  title: "Create Your Account | Join Kinscare Today",
  description:
    "Sign up for Kinscare to access personalized care services, caregiver opportunities, and healthcare provider tools. Quick and secure registration.",
  keywords: [
    "Kinscare Signup",
    "Create Account Kinscare",
    "Caregiver Registration",
    "Healthcare Provider Account",
    "Kinscare Account",
  ],
  openGraph: {
    title: "Create Your Account | Join Kinscare Today",
    description:
      "Sign up to join Kinscare and access personalized caregiver services and healthcare tools.",
    url: "https://www.kinscare.com/signup",
    siteName: "Kinscare",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
        width: 1200,
        height: 630,
        alt: "Kinscare Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Your Account | Join Kinscare Today",
    description:
      "Sign up for Kinscare and get started with personalized caregiver services.",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.kinscare.com/signup",
  },
};

function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Signup for Kinscare",
    description:
      "Create your Kinscare account to access caregiving opportunities, healthcare provider tools, and personalized services.",
    url: "https://www.kinscare.com/signup",
    publisher: {
      "@type": "Organization",
      name: "Kinscare",
      logo: {
        "@type": "ImageObject",
        url: "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
        width: 500,
        height: 500,
      },
    },
  };

  return (
    <>
      {/* Add JSON-LD for structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
      <Signup />
      </GoogleOAuthProvider>
    </>
  );
}

export default Page;
