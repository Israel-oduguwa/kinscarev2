import AccountSettings from "@/Providers/User/AccountSettings";
import React from "react";
import { Metadata } from "next";

// Metadata for SEO and Open Graph
export const metadata: Metadata = {
  title: "Account Settings - Manage Your Preferences",
  description:
    "Access your account settings to manage your preferences, update account details, and ensure your profile is up-to-date.",
  openGraph: {
    title: "Account Settings - Manage Your Preferences",
    description:
      "Access your account settings to manage your preferences, update account details, and ensure your profile is up-to-date.",
    url: "https://kinscare.org/account/settings", // Replace with the actual page URL
    type: "website",
    images: [
      {
        url: "https://kinscare.org/images/account-settings-og-image.jpg", // Replace with your relevant image URL
        width: 1200,
        height: 630,
        alt: "Account Settings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Account Settings - Manage Your Preferences",
    description:
      "Keep your account preferences up-to-date. Manage profile settings, privacy, and account details seamlessly.",
    images: [
      "https://kinscare.org/images/account-settings-twitter-image.jpg", // Replace with a relevant image URL
    ],
  },
};

function Page() {
  return (
    <div>
      <AccountSettings />
    </div>
  );
}

export default Page;
