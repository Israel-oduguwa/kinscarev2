// app/faq/page.tsx
import React from "react";
import type { Metadata} from "next";
import Link from "next/link";

// Import your custom components (adjust the paths as needed)
import Navbar from "@/WebPages/Navbar";
// Import the Accordion components from shadcn/ui (or your own implementation)
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Footer from "@/WebPages/Footer";
import { Button } from "@/components/ui/button";
// SEO metadata for Next.js (v13/15)
export const metadata: Metadata = {
  title: "Frequently Asked Questions Caregivers | Kinscare",
  description:
    "Get answers to common questions about Kinscare—a platform for applying to caregiving jobs. Learn about job search tips, licensing requirements, and more.",
};

const FAQPage: React.FC = () => {
  return (
    <>
      {/* Top Navbar */}
      <Navbar />

      {/* Main content with top margin */}
      <div className="mt-10">
        <div className="max-w-6xl py-20 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="p-4 border border-gray-300 mb-6 text-center rounded-lg bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              The best way to find local nurse aide (CNA), home care aide (HCA),
              and companion job opportunities near you.
            </p>
          </div>

          {/* FAQ Accordion Section */}
          <Accordion type="single" collapsible>
            {/* 1. What is Kinscare? */}
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                What is Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Kinscare is a service for searching, finding, and applying for
                  nurse aide (CNA), home care aide (HCA), and companion jobs near
                  you.
                </p>
                <p className="mt-2">
                  There are full‑time, part‑time, live‑in, on‑call, and weekend
                  jobs available in adult family homes, home care and staffing
                  agencies, skilled nursing facilities, assisted living homes,
                  and private residences.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Who should use Kinscare? */}
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                Who should use Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Anyone looking for a caregiving job—whether it’s a CNA/NAC role,
                  HCA position, or companionship/sitter opportunity—should use
                  Kinscare. It’s perfect for finding your first job or securing a
                  second one.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 3. What is the best way to find a job? */}
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                What is the best way to find a job?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  To apply for a job, you must first sign up (or sign in if you
                  already have an account). Once logged in, you can search for jobs
                  by schedule (e.g., “Full time” or “Live‑In”) and by license (e.g.,
                  “CNA” or “HCA”). If you don’t have a license, select “Companion”
                  as your license type.
                </p>
                <p className="mt-2">
                  The jobs at the top of the search results are the most recent;
                  we recommend applying to 4–8 jobs to boost your chances. Be sure
                  to list all your certifications (e.g., CPR/FA, Food Handler’s card,
                  Blood borne pathogens, etc.) when applying.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Why use Kinscare? */}
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                Why use Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Kinscare’s focus on caregivers and ease of use saves you both
                  time and money. Our platform aggregates caregiving job
                  opportunities near you, making it the most efficient way to
                  find your next job.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Are you interested in becoming a caregiver? */}
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                Are you interested in becoming a caregiver?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  We encourage you to pursue a career in caregiving if you have even
                  a slight interest. It’s a rewarding and fulfilling career that can
                  make a significant impact on someone’s life—even though it can be
                  physically demanding.
                </p>
                <p className="mt-2">
                  With an increasing demand driven by the growing baby boomer
                  population, caregiving is a secure career choice that is likely to
                  remain in demand for decades. Moreover, experience in caregiving
                  can set you apart if you decide to pursue advanced degrees in
                  healthcare.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 6. Do all caregivers jobs require a license? */}
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                Do all caregivers jobs require the caregiver to have a license?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Being a licensed caregiver means you’ve completed the necessary
                  training and passed a state‑administered exam. While most employers
                  require a license, some may hire you if you’re still in training.
                  Additionally, some employers provide in‑house training or financial
                  support for obtaining a license.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 7. Who uses Kinscare to find and recruit caregivers? */}
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold">
                Who uses Kinscare to find and recruit caregivers?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Local nursing homes, assisted living facilities, home care
                  agencies, staffing agencies, adult family homes, hospitals, and
                  clinics post caregiving jobs (for CNAs, HCAs, and companions) on
                  Kinscare. These opportunities can be full‑time, part‑time, on‑call,
                  live‑in, or weekend roles.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 8. What role does Kinscare play after you find a job? */}
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold">
                What role does Kinscare play after you find a job?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Once you find a job, our involvement ends. Your employer takes
                  over the process from there.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 9. Which caregiving job meets clinical experience requirements? */}
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-semibold">
                Which type of caregiving job meets clinical experience
                requirements for advanced healthcare programs?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  For programs in medicine, physician assistant studies, pharmacy,
                  nursing, respiratory technology, etc., clinical experience is often
                  required. Working as a licensed nurse aide (CNA) is typically the
                  only experience that meets these requirements.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 10. How much does it cost to use Kinscare? */}
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-lg font-semibold">
                How much does it cost to use Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Kinscare is <span className="font-bold">FREE</span> of charge for
                  caregivers looking for work.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Call-to-Action Button */}
          <div className="mt-8">
            <Link href="/find-jobs">
              <Button className="w-full">
                Find Job
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
