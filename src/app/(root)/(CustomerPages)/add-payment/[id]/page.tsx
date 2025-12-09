import AddPayment from "@/HiringAgent/AddPayment";
import type { Metadata } from "next";

const SITE_URL = "https://www.kinscare.org";
const OG_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const canonicalPath = `/add-payment/${encodeURIComponent(id)}`;

  const title = "Secure Payment Authorization | KinsCare";
  const description =
    "Complete your secure, Stripe-powered authorization so we can match you with the right caregiver. No charge is made until we confirm your placement.";

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: [
      "caregiver payment",
      "secure payment",
      "Stripe checkout",
      "KinsCare billing",
      "caregiver matching",
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: canonicalPath,
      title,
      description,
      siteName: "KinsCare",
      type: "website",
      images: [{ url: OG_IMAGE, alt: "KinsCare secure payment" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

function page() {
  return <AddPayment />;
}

export default page;
