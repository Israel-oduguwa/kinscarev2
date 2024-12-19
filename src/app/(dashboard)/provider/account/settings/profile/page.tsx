import UpdateProfile from "@/Providers/User/UpdateProfile";
import React from "react";
import { Metadata } from "next";

// Metadata for SEO and Open Graph
export const metadata: Metadata = {
  title: "Update Your Profile - Manage Your Provider Account",
  description:
    "Update your provider account profile. Keep your account details up-to-date and ensure your information is accurate for better visibility and opportunities.",
  openGraph: {
    title: "Update Your Profile - Manage Your Provider Account",
    description:
      "Update your provider account profile. Keep your account details up-to-date and ensure your information is accurate for better visibility and opportunities.",
    url: "http://yourwebsite.com/providers/profile/update", // Replace with your page URL
    type: "website",
    images: [
      {
        url: "http://yourwebsite.com/images/update-profile-og-image.jpg", // Replace with a relevant image URL
        width: 1200,
        height: 630,
        alt: "Update Your Profile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Update Your Profile - Manage Your Provider Account",
    description:
      "Keep your profile updated to maximize opportunities. Ensure your information is accurate and up-to-date.",
    images: [
      "http://yourwebsite.com/images/update-profile-twitter-image.jpg", // Replace with a relevant image URL
    ],
  },
};

function Page() {
  return (
    <div>
      <UpdateProfile />
    </div>
  );
}

export default Page;
