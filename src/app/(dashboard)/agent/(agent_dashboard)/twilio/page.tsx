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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Twilio Applicants</h1>
        <Link href="/agent/twilio/add-provider">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add provider
          </Button>
        </Link>
      </div>
      <TwilioApplicantsPage />
    </div>
  );
}

export default Page;
