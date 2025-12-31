import type { Metadata } from "next";

const SITE_URL = "https://www.kinscare.org";
const OG_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Provider Signup | KinsCare",
  description:
    "Create your provider account to access caregiver matches and manage your job postings.",
  alternates: {
    canonical: "/add-payment/signup",
  },
  openGraph: {
    url: "/add-payment/signup",
    title: "Provider Signup | KinsCare",
    description:
      "Create your provider account to access caregiver matches and manage your job postings.",
    siteName: "KinsCare",
    type: "website",
    images: [{ url: OG_IMAGE, alt: "KinsCare provider signup" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Provider Signup | KinsCare",
    description:
      "Create your provider account to access caregiver matches and manage your job postings.",
    images: [OG_IMAGE],
  },
};

export default function AddPaymentSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
