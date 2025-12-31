import JumpstartMetrics from "@/HiringAgent/JumpstartMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jumpstart Metrics | Agent Dashboard",
  description: "Track Jumpstart flow performance and conversion health.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <JumpstartMetrics />;
}
