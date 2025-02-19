// app/faq/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

// Import your custom components (adjust the paths as needed)
import Navbar from "@/WebPages/Navbar";
import Footer from "@/WebPages/Footer";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

// SEO metadata for Next.js
export const metadata: Metadata = {
  title: "Frequently Asked Questions Caregivers | Kinscare",
  description:
    "Frequently Asked Questions about Kinscare – find local job opportunities for CNAs, HCAs, and companions. Learn about licensing, training, advanced healthcare programs, and more.",
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
              Find local job opportunities as a Certified Nursing Assistant (CNA),
              Home Care Aide (HCA), or Companion for full-time, part-time, weekend,
              live-in, or on-call positions.
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
                <p className="text-base">
                  Kinscare is a platform that connects caregivers with job
                  opportunities in adult family homes, home care agencies, staffing
                  agencies, skilled nursing facilities, assisted living homes, and
                  private residences.
                </p>
                <p className="mt-2 text-base">
                  Whether you’re a CNA, HCA, or companion/sitter, you can find
                  full-time, part-time, live-in, weekend, and on-call positions in
                  your area.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Who should use Kinscare? */}
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                Who should use Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> Kinscare is for anyone looking for a caregiving job, including:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Certified Nursing Assistants (CNAs) / Nursing Assistants-Certified (NACs)</li>
                  <li>Home Care Aides (HCAs)</li>
                  <li>Companions / Sitters</li>
                </ul>
                <p className="mt-2">
                  Whether you're looking for your first job, a second job, or a
                  better opportunity, Kinscare helps you find roles that match your
                  skills and availability.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 3. How do I find a job on Kinscare? */}
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                How do I find a job on Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside ml-4">
                  <li>Sign up or log in if you already have an account.</li>
                  <li>
                    Search for jobs based on schedule (e.g., "Full-time" or
                    "Live-in") and license type (e.g., "CNA" or "HCA"). If you don’t
                    have a license, select "Companion" as your role.
                  </li>
                  <li>
                    Apply to jobs—start with the most recent postings at the top of
                    the search results.
                  </li>
                  <li>
                    Increase your chances by applying to at least 4–8 jobs and
                    listing all certifications you have (e.g., CPR/First Aid, Food
                    Handler’s Card, Bloodborne Pathogens, etc.).
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Why choose Kinscare? */}
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                Why choose Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  Kinscare is designed specifically for caregivers, making it easy,
                  fast, and free to find nearby job opportunities. Unlike general job
                  boards, we focus only on caregiving roles, saving you time and
                  effort.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Do all caregiving jobs require a license? */}
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                Do all caregiving jobs require a license?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  Many caregiving jobs require a state-issued license, such as:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>CNA License (Certified Nursing Assistant)</li>
                  <li>HCA License (Home Care Aide)</li>
                </ul>
                <p className="mt-2">
                  However, some employers hire companions without a license or offer
                  on-the-job training if you're currently enrolled in a caregiving
                  program. Some employers may even help pay for your training.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 6. Who hires caregivers on Kinscare? */}
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                Who hires caregivers on Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> Caregivers using Kinscare get hired by:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Adult Family Homes</li>
                  <li>Assisted Living Facilities</li>
                  <li>Nursing Homes / Skilled Nursing Facilities</li>
                  <li>Home Care Agencies</li>
                  <li>Staffing Agencies</li>
                  <li>Hospitals & Clinics</li>
                  <li>Private Families</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 7. What happens after I find a job through Kinscare? */}
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold">
                What happens after I find a job through Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  Once you accept a job, your employer takes over from there. Kinscare
                  does not handle payroll, scheduling, or employment-related matters.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 8. Interested in becoming a caregiver? */}
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold">
                Interested in becoming a caregiver?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  If you're considering a career in caregiving, go for it! Caregiving
                  is:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    A fulfilling and in-demand profession that allows you to make a
                    real difference in people’s lives.
                  </li>
                  <li>
                    A stable career with increasing pay due to the growing elderly
                    population.
                  </li>
                  <li>
                    A great foundation for anyone considering a future in healthcare.
                  </li>
                </ul>
                <p className="mt-2">
                  Many caregivers go on to become nurses, respiratory therapists,
                  physician assistants, pharmacists, and more.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 9. What types of healthcare programs can I pursue beyond caregiving? */}
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-semibold">
                What types of healthcare programs can I pursue beyond caregiving?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  Many caregivers use their experience to advance into healthcare
                  careers such as:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Licensed Practical Nurse (LPN)</li>
                  <li>Registered Nurse (RN, BSN, MSN, etc.)</li>
                  <li>Medical Assistant (MA)</li>
                  <li>Respiratory Therapist (RT)</li>
                  <li>Surgical Technologist</li>
                  <li>Pharmacy Technician / Pharmacist</li>
                  <li>Physical Therapy Assistant (PTA) / Occupational Therapy Assistant (OTA)</li>
                  <li>Physician Assistant (PA)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 10. Does caregiving experience help with nursing and healthcare programs? */}
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-lg font-semibold">
                Does caregiving experience help with nursing and healthcare programs?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  Yes! Many nursing and allied healthcare programs require direct
                  patient care experience. Being a CNA is one of the best ways to
                  gain this experience before applying to nursing school or other
                  healthcare programs.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 11. What caregiving jobs count as clinical experience for advanced healthcare programs? */}
            <AccordionItem value="item-11">
              <AccordionTrigger className="text-lg font-semibold">
                What caregiving jobs count as clinical experience for advanced healthcare programs?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  Many healthcare programs require "hands-on" patient care experience
                  before admission. CNA jobs are widely accepted because they involve
                  direct care, assisting with daily activities, and working in
                  clinical settings.
                </p>
                <p className="mt-2">
                  Programs that may require clinical experience include:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Nursing (RN, BSN, MSN, etc.)</li>
                  <li>Physician Assistant (PA)</li>
                  <li>Respiratory Therapy (RT)</li>
                  <li>Pharmacy School</li>
                  <li>Medical School (MD, DO, etc.)</li>
                </ul>
                <p className="mt-2">
                  If you're thinking about applying to one of these programs,
                  working as a CNA can strengthen your application!
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 12. Where can I find training for a CNA, HCA, or other healthcare role? */}
            <AccordionItem value="item-12">
              <AccordionTrigger className="text-lg font-semibold">
                Where can I find training for a CNA, HCA, or other healthcare role?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  You can find local training programs for CNAs, HCAs, and other
                  healthcare careers at:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Community colleges</li>
                  <li>Vocational schools</li>
                  <li>Healthcare facilities offering in-house training</li>
                  <li>State-approved online programs</li>
                </ul>
                <p className="mt-2">
                  Kinscare helps connect you to colleges and universities with
                  healthcare programs so you can explore different career pathways.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 13. How much does it cost to use Kinscare? */}
            <AccordionItem value="item-13">
              <AccordionTrigger className="text-lg font-semibold">
                How much does it cost to use Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base"> 
                  Kinscare is completely free for caregivers looking for jobs. There
                  are no fees to sign up, search, or apply for jobs.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Call-to-Action Button */}
          <div className="mt-8">
            <Link href="/find-jobs">
              <Button className="w-full">Find Job</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Optional Footer */}
      <Footer />
    </>
  );
};

export default FAQPage;
