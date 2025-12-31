import AgentEditJob from "@/HiringAgent/AgentEditJob";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Job | Agent Dashboard",
  description: "Update job details, requirements, and schedule.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AgentEditJob />;
}
