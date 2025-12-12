"use client";

import TwilioProviderLeadForm from "@/WebPages/TwilioProviderLeadForm";
import { useRouter } from "next/navigation";

type ClientProps = {
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

export default function AddProviderClient({ searchParams }: ClientProps) {
  const router = useRouter();

  const parsedTags =
    searchParams?.tags
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean) || [];

  return (
    <TwilioProviderLeadForm
      variant="dashboard"
      initialEmail={searchParams?.email || ""}
      initialPhone={searchParams?.phone || ""}
      initialZipcode={searchParams?.zipcode || ""}
      flowSid={searchParams?.flowSid}
      executionSid={searchParams?.executionSid}
      source={searchParams?.source}
      tags={parsedTags}
      onSuccess={() => router.back()}
    />
  );
}
