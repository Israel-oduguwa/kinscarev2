import CaregiverDetails from "@/HiringAgent/CaregiverDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Caregiver Detail | Agent Dashboard",
  description: "Review caregiver profile, experience, and availability.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return (
    <CaregiverDetails />
  );
}

export default page;
