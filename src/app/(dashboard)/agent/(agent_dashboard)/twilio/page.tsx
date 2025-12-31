import TwilioApplicantsPage from "@/HiringAgent/TwilioApplicantsPage";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Twilio Applicants | Agent Dashboard",
  description: "Manage Twilio SMS leads and job actions for providers.",
  robots: {
    index: false,
    follow: false,
  },
};

function Page() {
  return (
    <div className="space-y-4">
      <TwilioApplicantsPage />
    </div>
  );
}

export default Page;
