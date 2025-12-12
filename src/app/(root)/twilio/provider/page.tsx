import TwilioProviderLeadForm from "@/WebPages/TwilioProviderLeadForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Provider to Twilio SMS Flow | KinsCare",
  description:
    "Capture provider contact details to enroll them into the Twilio SMS flow for quick follow-up.",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams?: {
    email?: string;
    phone?: string;
    zipcode?: string;
    flowSid?: string;
    executionSid?: string;
    source?: string;
    tags?: string;
  };
};

export default function Page({ searchParams }: PageProps) {
  const parsedTags =
    searchParams?.tags
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean) || [];

  return (
    <TwilioProviderLeadForm
      initialEmail={searchParams?.email || ""}
      initialPhone={searchParams?.phone || ""}
      initialZipcode={searchParams?.zipcode || ""}
      flowSid={searchParams?.flowSid}
      executionSid={searchParams?.executionSid}
      source={searchParams?.source}
      tags={parsedTags}
    />
  );
}
