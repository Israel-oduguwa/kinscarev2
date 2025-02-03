// app/faq/page.tsx
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

// Import your custom components (adjust the paths as needed)
import Navbar from "@/WebPages/Navbar";

// Import shadcn/ui Accordion components (or your own implementations)
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Footer from "@/WebPages/Footer";
// SEO metadata (Next.js 13/15 metadata API)
export const metadata: Metadata = {
  title: "Frequently Asked Questions Providers | Kinscare",
  description:
    "Find answers to your questions about Kinscare – the service that helps you search, find, and contact caregivers near you.",
};

const FAQPage: React.FC = () => {
  return (
    <>
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content wrapper with some top margin */}
      <div className="mt-10">
        <div className="max-w-6xl py-20 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="p-4 border border-gray-300 mb-6 text-center rounded-lg bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              The best way to find local nurse aides (CNAs), home care
              assistants (HCAs), and caregivers/companions looking for
              full‑time, part‑time, live‑in, on‑call, and weekend jobs.
            </p>
          </div>

          {/* FAQ Accordion Section */}
          <div className="mt-10 space-y-4">
            <Accordion type="single" collapsible>
              {/* Question 1 */}
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">
                  What is Kinscare?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Kinscare is a service for searching, finding, and contacting
                    caregivers near you who are looking for work, as well as for
                    posting caregiver job openings.
                  </p>
                  <p className="mt-2">
                    The caregivers on Kinscare seek full‑time, part‑time,
                    live‑in, on‑call, and weekend jobs in adult family homes,
                    home care agencies, staffing agencies, skilled nursing
                    facilities, assisted living homes, and private homes.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 2 */}
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold">
                  Who should use Kinscare?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Anyone in need of a caregiver – whether you’re a family
                    member looking for a companion or sitter for a loved one, a
                    staffing coordinator at a nursing home seeking a CNA, or a
                    recruiter at a home care agency looking for a home care
                    aide.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 3 */}
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-semibold">
                  Why use Kinscare?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Kinscare’s focus on caregivers and ease of use saves you
                    time and money. Our targeted recruitment of job‑seeking
                    caregivers near you makes us the most efficient service for
                    pairing caregivers with those who need them.
                  </p>
                  <p className="mt-2 font-bold">
                    Remember, lack of a caregiver has its own costs!
                  </p>
                  <p className="mt-2">
                    Injury to the primary caregiver, schedule disruption,
                    stress, overtime pay, staff turnover, and burnout are just
                    some of the risks associated with not having a caregiver.
                    These costs can be mitigated by hiring a caregiver for a few
                    hours a day or a few days a week.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 4 */}
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-semibold">
                  What is the best way to find a caregiver?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Posting your job opening and simultaneously searching for
                    caregivers is the most effective way to find the right
                    match.
                  </p>
                  <p className="mt-2">
                    When you post your job, caregivers nearby receive email and
                    text alerts with details on how to apply and whom to
                    contact.
                  </p>
                  <p className="mt-2">
                    You can also search by availability (e.g., “Full time” or
                    “Part time”) and by license (e.g., “CNA/NAC”, “HCA”, or
                    “Companion”). We ’ll match the best caregivers to your
                    criteria and show you their resumes along with additional
                    recommendations.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 5 */}
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-semibold">
                  How can you contact a caregiver?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Click on the “View Contact Details” button on a caregiver’s
                    resume to see their contact information. We recommend using
                    the Kinscare platform to reach out, so the caregiver
                    receives an email and text alert notifying them of your
                    inquiry.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 6 */}
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-semibold">
                  How does Kinscare find caregivers?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    We connect with local training and vocational programs,
                    community colleges, barbershops, hair salons, immigrant
                    non-profit agencies, workforce development centers, county
                    job initiatives, referrals, and even paid media to recruit
                    caregivers.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 7 */}
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-semibold">
                  Are all caregivers on Kinscare licensed?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Most caregivers on Kinscare are licensed, meaning they have
                    been trained and passed a state‑administered exam. You can
                    filter your search by “CNA/NAC” or “HCA” to view licensed
                    caregivers.
                  </p>
                  <p className="mt-2">
                    However, not every caregiver role requires licensing—for
                    example, companionship does not.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 8 */}
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-semibold">
                  What role does Kinscare play after you find a potential
                  caregiver?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Our role is to match qualified caregivers with those in
                    need. We do not conduct background checks, handle payroll,
                    or perform any additional caregiver onboarding.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 9 */}
              <AccordionItem value="item-9">
                <AccordionTrigger className="text-lg font-semibold">
                  How much does it cost to use Kinscare?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Kinscare is a pay‑for‑use service, much like Uber, rather
                    than a subscription service like Netflix.
                  </p>
                  <p className="mt-2">
                    After a 7‑day trial, our pricing is as follows: $16.99 for
                    1‑day usage, $58.99 for 1‑week usage, or $83.99 for 30‑day
                    usage.{" "}
                    <span className="font-bold">
                      Payments are NOT on autopay
                    </span>
                    – you must manually pay for each new period.
                  </p>
                  <p className="mt-2">
                    Our revenues help fund the recruitment of caregivers and
                    support workers in adjacent service industries.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 10 */}
              <AccordionItem value="item-10">
                <AccordionTrigger className="text-lg font-semibold">
                  Is Kinscare a subscription?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    No. Kinscare is a pay‑for‑use service operating similarly to
                    Uber, not a subscription service.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Question 11 */}
              <AccordionItem value="item-11">
                <AccordionTrigger className="text-lg font-semibold">
                  Does Kinscare have any other fees?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Kinscare does not charge any additional fees. There are:
                  </p>
                  <ul className="list-disc ml-5 mt-2">
                    <li>No initiation or setup fees</li>
                    <li>No onboarding fees</li>
                    <li>
                      No hourly rate agency fees – you negotiate directly with
                      the caregiver(s)
                    </li>
                    <li>No cancellation fees – you can cancel anytime</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Question 12 */}
              <AccordionItem value="item-12">
                <AccordionTrigger className="text-lg font-semibold">
                  How long is Kinscare&apos;s trial period?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Kinscare&apos;s trial period lasts for 7 days. We hope
                    you’ll experience the value of our service during this time,
                    which in turn supports our recruitment efforts.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Button to Find Caregivers */}
          <div className="mt-8">
            <Link href="/find-caregivers">
              <Button className="w-full">Find Caregivers</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default FAQPage;
