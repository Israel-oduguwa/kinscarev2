import TwilioApplicantsDetails from "@/HiringAgent/TwilioApplicantsDetails";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Twilio Applicant Details | Agent Dashboard",
  description: "Review applicant details, jobs, and actions for Twilio leads.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return <TwilioApplicantsDetails />;
}

export default page;
