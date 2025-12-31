import JobDetail from "@/HiringAgent/JobDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Detail | Agent Dashboard",
  description: "View job details, applicants, and provider status.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return (
    <>
      <JobDetail />
    </>
  );
}

export default page;
