import PostJobApplicant from "@/HiringAgent/PostJobApplicant";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post Job for Applicant | Agent Dashboard",
  description: "Create a job post for a Twilio applicant.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return (
    <>
      <PostJobApplicant />
    </>
  );
}

export default page;
