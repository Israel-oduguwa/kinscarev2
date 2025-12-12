import { Metadata } from "next";
import AddProviderClient from "./AddProviderClient";

export const metadata: Metadata = {
  title: "Add Provider | Twilio SMS Flow",
  description: "Capture provider details to enroll them in the Twilio SMS flow.",
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
  return <AddProviderClient searchParams={searchParams} />;
}
