// app/refer-and-earn/page.tsx or page.jsx

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Gift, ArrowRight } from "lucide-react";
import CreateJobNewUser from "@/CrowdPost/Jobs/CreateJobNewUser";
import { WhatsappShareButton } from "next-share";

// Optional: Your beautiful animated blob/card design component here
// import ReferEarnCard from "@/components/ReferEarnCard";

export const metadata = {
  title: "Refer & Earn – Get Paid to Share Caregiving Jobs | KinsCare",
  description:
    "Help connect employers with quality caregivers! Share your referral link, help care homes and agencies find staff, and earn up to $55 when they hire through KinsCare.",
  openGraph: {
    title: "Refer & Earn – KinsCare",
    description:
      "Know someone looking to hire caregivers? Share your referral link and earn rewards up to $55. Empower care homes, agencies, and families to find top caregiving talent.",
    url: "https://www.kinscare.org/refer-and-earn",
    siteName: "KinsCare",
    images: [
      {
        url: "https://www.kinscare.org/assets/refer-earn-og.png", // Change to your hero/OG image
        width: 1200,
        height: 630,
        alt: "Refer & Earn at KinsCare",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Refer & Earn – KinsCare",
    description:
      "Share a job, earn rewards! Connect care employers with great caregivers and get paid up to $55 for every successful hire.",
    images: ["https://www.kinscare.org/assets/refer-earn-og.png"], // Replace as needed
  },
  alternates: {
    canonical: "https://www.kinscare.org/refer-and-earn",
  },
};

// JSON-LD Schema for Rich Snippets
const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Refer & Earn – KinsCare",
  description:
    "Earn up to $55 for every care home, agency, or family you help hire caregivers. Share jobs, help your community, and get paid with KinsCare's Refer & Earn program.",
  url: "https://www.kinscare.org/refer-and-earn",
};

export default function ReferAndEarnPage() {
  const referralLink = "https://www.kinscare.org/refer-and-earn"; // Change as needed

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>
          Refer & Earn – Get Paid to Share Caregiving Jobs | KinsCare
        </title>
        <meta
          name="description"
          content="Help connect employers with quality caregivers! Share your referral link, help care homes and agencies find staff, and earn up to $55 when they hire through KinsCare."
        />
        <link rel="canonical" href="https://www.kinscare.org/refer-and-earn" />
        <meta property="og:title" content="Refer & Earn – KinsCare" />
        <meta
          property="og:description"
          content="Know someone looking to hire caregivers? Share your referral link and earn rewards up to $55. Empower care homes, agencies, and families to find top caregiving talent."
        />
        <meta
          property="og:url"
          content="https://www.kinscare.org/refer-and-earn"
        />
        <meta
          property="og:image"
          content="https://www.kinscare.org/assets/refer-earn-og.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Refer & Earn – KinsCare" />
        <meta
          name="twitter:description"
          content="Share a job, earn rewards! Connect care employers with great caregivers and get paid up to $55 for every successful hire."
        />
        <meta
          name="twitter:image"
          content="https://www.kinscare.org/assets/refer-earn-og.png"
        />
        {/* Schema.org */}
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Head>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <section className="relative w-full py-12 max-w-screen-xl">
          <CreateJobNewUser type={"new"} />
        </section>
      </main>
    </>
  );
}
