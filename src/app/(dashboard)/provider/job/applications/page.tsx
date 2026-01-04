import ProviderApplications from "@/Providers/Jobs/ProviderApplications";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Applications - Provider Dashboard",
  description:
    "Review caregivers who applied to your posted jobs. Track applications and connect with top candidates.",
  openGraph: {
    title: "Applications - Provider Dashboard",
    description:
      "Review caregivers who applied to your posted jobs. Track applications and connect with top candidates.",
    url: "https://kinscare.org/provider/job/applications",
    type: "website",
  },
};

function Page() {
  return (
    <div>
      <ProviderApplications />
    </div>
  );
}

export default Page;
