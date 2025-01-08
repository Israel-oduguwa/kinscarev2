import { Metadata } from "next";
import Signin from "../../../Authentication/Signin";

// Define Metadata for SEO
export const metadata: Metadata = {
  title: "Sign In to Kinscare | Join the Community",
  description:
    "Sign in to Kinscare to access personalized care services, caregiver opportunities, and more. Secure and easy sign-in for all users.",
  keywords: [
    "Kinscare Sign In",
    "Caregiver Login",
    "Provider Login",
    "Healthcare Services",
    "Kinscare Account",
    "caregiver",
    "provider",
    "jobs",
    "job",
    "Health care",
    "care",
    "Health",
  ],
  openGraph: {
    title: "Sign In to Kinscare | Join the Community",
    description:
      "Securely log in to access Kinscare's personalized caregiver and healthcare services.",
    url: "https://www.kinscare.org/signin",
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
    title: "Sign In to Kinscare | Join the Community",
    description:
      "Securely log in to access Kinscare's personalized caregiver and healthcare services.",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.kinscare.org/signin",
  },
};

function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Sign In to Kinscare",
    description:
      "Sign in to Kinscare to access personalized care services, caregiver opportunities, and more. Secure and easy sign-in for all users.",
    url: "https://www.kinscare.com/signin",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />{" "}
      <Signin />
    </>
  );
}

export default Page;
