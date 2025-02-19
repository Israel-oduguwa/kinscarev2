// app/providers-faq/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

// Replace these with your actual component paths
import Navbar from "@/WebPages/Navbar";
import Footer from "@/WebPages/Footer";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

// Example SEO metadata
export const metadata: Metadata = {
  title: "Frequently Asked Questions for Providers | Kinscare",
  description:
    "Answers to common questions about Kinscare for providers and employers. Learn how to find and contact caregivers, our costs, free trial, and more.",
};

const ProviderFAQPage: React.FC = () => {
  return (
    <>
      <Navbar />

      <div className="mt-10">
        <div className="max-w-6xl py-20 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="p-4 border border-gray-300 mb-6 text-center rounded-lg bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-900">
              Frequently Asked Questions (FAQs) for Providers and Employers
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              The most efficient way to connect with local CNAs, Home Care
              Assistants (HCAs), and caregivers/companions looking for full-time,
              part-time, weekend, live-in, and on-call opportunities.
            </p>
          </div>

          {/* Accordion FAQ */}
          <Accordion type="single" collapsible>
            {/* 1. What is Kinscare? */}
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                What is Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Kinscare is a platform that connects providers and individuals
                  seeking caregivers. Whether you need a Certified Nursing
                  Assistant (CNA), Home Care Assistant (HCA), or companion
                  caregiver, Kinscare helps you find qualified candidates near
                  you. Providers can also post caregiver job openings for better
                  visibility.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Who should use Kinscare? */}
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                Who should use Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p>Kinscare is designed for:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Adult Family Homes</li>
                  <li>Home Care &amp; Staffing Agencies</li>
                  <li>Skilled Nursing Facilities</li>
                  <li>Assisted Living Homes</li>
                  <li>Private Families Looking for Caregivers</li>
                </ul>
                <p className="mt-2">
                  Caregivers on Kinscare seek full-time, part-time, live-in,
                  weekend, and on-call opportunities in these settings.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Why use Kinscare? */}
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                Why use Kinscare?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Whether you're a staffing coordinator, recruiter, or a family
                  member looking for a caregiver, Kinscare simplifies your
                  search.
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong>Find caregivers faster</strong> – Our platform
                    focuses exclusively on caregivers actively looking for jobs.
                  </li>
                  <li>
                    <strong>Save time &amp; money</strong> – No lengthy
                    recruitment processes. Post a job and get applications
                    directly.
                  </li>
                  <li>
                    <strong>Reduce risks &amp; costs</strong> – Caregiver
                    shortages lead to stress, burnout, overtime pay, and
                    schedule disruptions. Hiring even part-time caregivers can
                    help mitigate these issues.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 4. How do I find a caregiver? */}
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                How do I find a caregiver?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  The best approach is to post a job and actively search for
                  candidates.
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong>Posting a job</strong> – Caregivers near you
                    receive email and text alerts about your post, application
                    process, and contact details.
                  </li>
                  <li>
                    <strong>Searching for caregivers</strong> – Filter
                    caregivers based on availability (full-time, part-time,
                    live-in) and credentials (CNA/NAC, HCA, Companion).
                  </li>
                </ul>
                <p className="mt-2">
                  Once you find a match, you’ll see their resume, contact
                  information, and additional recommended candidates.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 5. How do I contact a caregiver? */}
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                How do I contact a caregiver?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Click the “View Contact Details” button on a caregiver’s
                  profile to see their phone number and email.
                </p>
                <p className="mt-2">
                  For better response rates, contact caregivers directly through
                  Kinscare, as they will receive an email and text alert
                  prompting them to respond.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 6. How does Kinscare find caregivers? */}
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                How does Kinscare find caregivers?
              </AccordionTrigger>
              <AccordionContent>
                <p>We actively recruit caregivers through:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Local vocational programs &amp; community colleges</li>
                  <li>Barbershops &amp; hair salons (common community hubs)</li>
                  <li>Immigrant non-profits &amp; workforce centers</li>
                  <li>County job initiatives &amp; referrals</li>
                  <li>Targeted online and offline media campaigns</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 7. Are all caregivers on Kinscare licensed? */}
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold">
                Are all caregivers on Kinscare licensed?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Most caregivers on Kinscare are licensed, having completed
                  state-administered training and exams.
                </p>
                <p className="mt-2">
                  You can filter searches for CNA/NAC or HCA to find licensed
                  caregivers. However, some caregiver roles, such as
                  companionship, do not require licensing.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 8. What happens after I find a caregiver? */}
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold">
                What happens after I find a caregiver?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Kinscare connects you with caregivers but does not handle:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Background checks</li>
                  <li>Payroll</li>
                  <li>Onboarding or training</li>
                </ul>
                <p className="mt-2">
                  You coordinate hiring directly with the caregiver.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 9. How much does Kinscare cost? */}
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-semibold">
                How much does Kinscare cost?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Kinscare operates on a pay-as-you-go model, similar to
                  Uber—not a subscription service like Netflix.
                </p>
                <p className="mt-2">
                  After a 7-day free trial, pricing is:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>$16.99 for 1 day</li>
                  <li>$58.99 for 1 week</li>
                  <li>$83.99 for 30 days</li>
                </ul>
                <p className="mt-2">
                  Payments are not auto-renewed, so you only pay when you need
                  to recruit and can cancel anytime.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 10. Does Kinscare have hidden fees? */}
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-lg font-semibold">
                Does Kinscare have hidden fees?
              </AccordionTrigger>
              <AccordionContent>
                <p>No. Kinscare has no:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>✅ Initiation or setup fees</li>
                  <li>✅ Onboarding fees</li>
                  <li>✅ Hourly rate agency fees (you negotiate directly with caregivers)</li>
                  <li>✅ Cancellation fees – cancel anytime</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 11. How long is the free trial? */}
            <AccordionItem value="item-11">
              <AccordionTrigger className="text-lg font-semibold">
                How long is the free trial?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Kinscare offers a 7-day free trial to help you explore our
                  platform and find caregivers. If you see value in our service,
                  your payment helps fund caregiver recruitment efforts in your
                  area.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 12. How Can Providers Benefit from Engaging with Aspiring Healthcare Professionals? */}
            <AccordionItem value="item-12">
              <AccordionTrigger className="text-lg font-semibold">
                How Can Providers Benefit from Engaging with Aspiring Healthcare Professionals?
              </AccordionTrigger>
              <AccordionContent>
                <h3 className="text-md font-semibold mt-2">
                  Why should providers engage with individuals exploring a career in healthcare?
                </h3>
                <p className="mt-2">
                  Many people interested in becoming CNAs, HCAs, or nurses use
                  Kinscare to learn about training programs and career
                  opportunities. These individuals are eager to gain experience,
                  and by engaging with them, providers can:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong>Build a Reliable Talent Pipeline</strong> – Today’s
                    aspiring healthcare worker could be your next CNA or HCA.
                    Connecting early helps you secure future hires.
                  </li>
                  <li>
                    <strong>Offer Training &amp; Career Growth</strong> – Some
                    providers offer in-house training or tuition assistance to
                    attract and retain dedicated workers.
                  </li>
                  <li>
                    <strong>Fill Entry-Level Roles Quickly</strong> – Many
                    individuals seeking healthcare careers are open to working
                    as caregivers, companions, or assistants while completing
                    their certifications.
                  </li>
                  <li>
                    <strong>Reduce Turnover with Career Advancement</strong> –
                    Employees who see a clear career path within your
                    organization are more likely to stay long-term.
                  </li>
                </ul>

                <h3 className="text-md font-semibold mt-4">
                  How can providers connect with people starting their healthcare careers?
                </h3>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Post job opportunities for entry-level caregivers. Many
                    individuals are willing to start as companions or assistants
                    to gain hands-on experience.
                  </li>
                  <li>
                    Highlight training and career growth options in job
                    descriptions. If you offer tuition reimbursement or
                    certification programs, make it known.
                  </li>
                  <li>
                    Proactively reach out to job seekers who may be a great fit
                    for your team.
                  </li>
                </ul>
                <p className="mt-2">
                  Engaging with people at the start of their healthcare journey
                  isn’t just about filling current vacancies—it’s an investment
                  in a strong, motivated workforce for the future.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Example CTA Button or Additional Links */}
          <div className="mt-8">
            <Link href="/post-a-job">
              <Button className="w-full">Post a Job</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProviderFAQPage;
