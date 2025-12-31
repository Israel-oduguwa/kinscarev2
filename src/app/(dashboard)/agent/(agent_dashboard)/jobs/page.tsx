import AllJobs from "@/HiringAgent/AllJobs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Jobs | Agent Dashboard",
  description: "Browse, filter, and manage all Jumpstart job postings.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return (
    <div>
      <AllJobs />
    </div>
  );
}

export default page;
