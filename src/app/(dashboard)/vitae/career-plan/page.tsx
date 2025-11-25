import CareerPathHub from "@/Caregivers/CareerPlan/CareerPathHub";
import { DialogProvider } from "@/Caregivers/CaregiverContext/DialogProvider";
import CaregiverDash from "@/Caregivers/DashBoard/CaregiverDash";
import React from "react";

export const metadata = {
  title: "Career Plan | KinsCare Dashboard",
  description:
    "Discover rewarding careers in nursing and allied healthcare. From RNs to therapists and technicians, explore high-demand jobs, flexible work settings, and connect with local training institutions to start your journey with KinsCare.",
  openGraph: {
    title: "Explore Nursing & Allied Healthcare Careers | KinsCare Dashboard",
    description:
      "KinsCare helps you explore career paths in nursing and allied health. Find education programs, career advice, and flexible job opportunities that make a difference.",
    url: "https://www.kinscare.org/caregivers/dashboard",
    siteName: "KinsCare",
    images: [
      {
        url: "https://kinscare-storage.s3.us-east-1.amazonaws.com/KinsCare+Explore+Careers+OpenGraph.png",
        width: 1200,
        height: 630,
        alt: "Explore Nursing & Allied Healthcare Careers | KinsCare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Nursing & Allied Healthcare Careers | KinsCare Dashboard",
    description:
      "Discover thriving careers in nursing and allied health. Connect with local training institutions and shape your future with KinsCare.",
    images: [
      "https://kinscare-storage.s3.us-east-1.amazonaws.com/KinsCare+Explore+Careers+OpenGraph.png",
    ],
  },
};


function page() {
  return (
    <div>
      <DialogProvider>
        {/* <CaregiverDash /> */}
        <CareerPathHub/>
      </DialogProvider>
    </div>
  );
}

export default page;
