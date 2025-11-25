import ReferralTracking from '@/Caregivers/DashBoard/ReferralTracking';
import React from 'react';

// SEO for Caregiver Referral Tracking Page
export const metadata = {
  title: "Referral Rewards | Track Your Provider Referrals | KinsCare",
  description:
    "Caregivers: Track your KinsCare referral rewards for every provider you refer. See the status of each referral, bonus eligibility, and payout progress. KinsCare makes it easy to earn for bringing providers to our platform.",
  openGraph: {
    title: "Referral Rewards | Track Your Provider Referrals | KinsCare",
    description:
      "Easily track the status and rewards for all providers you have referred as a caregiver. See your KinsCare referral bonuses and payout progress.",
    url: "https://www.kinscare.org/caregivers/referral-tracking",
    siteName: "KinsCare",
    images: [
      {
        url: "https://kinscare-storage.s3.us-east-1.amazonaws.com/KinsCare+Referral+OpenGraph.png",
        width: 1200,
        height: 630,
        alt: "KinsCare Caregiver Referral Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Referral Rewards | Track Your Provider Referrals | KinsCare",
    description:
      "Monitor your referral rewards as a KinsCare caregiver. Track each provider you’ve referred and your bonus payout status.",
    images: [
      "https://kinscare-storage.s3.us-east-1.amazonaws.com/KinsCare+Referral+OpenGraph.png",
    ],
  },
};

export default function Page() {
  return <ReferralTracking />;
}
