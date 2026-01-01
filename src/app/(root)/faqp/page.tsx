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
     

      <div className="relative mt-10 overflow-hidden bg-slate-950/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(59,130,246,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_20%,rgba(30,64,175,0.1),transparent_60%)]" />
          <div className="absolute -top-24 right-6 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:36px_36px] opacity-35" />
        </div>
        <div className="max-w-7xl mt-20 py-20 mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Page Header */}
          <div className="p-8 border border-white/70 mb-8 text-center rounded-3xl bg-white/80 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-4">
              Provider FAQ
            </p>
            <h1 className="text-4xl md:text-5xl font-[family:var(--header-font)] font-extrabold text-slate-900">
              Frequently Asked Questions (FAQs) for Providers and Employers
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              The most efficient way to connect with local CNAs, Home Care
              Assistants (HCAs), and caregivers/companions looking for full-time,
              part-time, weekend, live-in, and on-call opportunities.
            </p>
          </div>

          {/* Accordion FAQ */}
          <Accordion type="single" collapsible className="space-y-4">
            {/* 1. What is Kinscare? */}
            <AccordionItem value="item-1" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                What is Kinscare?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">
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
            <AccordionItem value="item-2" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                Who should use Kinscare?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">Kinscare is designed for:</p>
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
            <AccordionItem value="item-3" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                Why use Kinscare?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">
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
            <AccordionItem value="item-4" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                How do I find a caregiver?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">
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
            <AccordionItem value="item-5" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                How do I contact a caregiver?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">
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
            <AccordionItem value="item-6" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                How does Kinscare find caregivers?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">We actively recruit caregivers through:</p>
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
            <AccordionItem value="item-7" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                Are all caregivers on Kinscare licensed?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">
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
            <AccordionItem value="item-8" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                What happens after I find a caregiver?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">
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
            <AccordionItem value="item-9" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                How much does Kinscare cost?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">
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
            <AccordionItem value="item-10" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                Does Kinscare have hidden fees?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">No. Kinscare has no:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>✅ Initiation or setup fees</li>
                  <li>✅ Onboarding fees</li>
                  <li>✅ Hourly rate agency fees (you negotiate directly with caregivers)</li>
                  <li>✅ Cancellation fees – cancel anytime</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 11. How long is the free trial? */}
            <AccordionItem value="item-11" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                How long is the free trial?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
               <p className="text-base">
                  Kinscare offers a 7-day free trial to help you explore our
                  platform and find caregivers. If you see value in our service,
                  your payment helps fund caregiver recruitment efforts in your
                  area.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 12. How Can Providers Benefit from Engaging with Aspiring Healthcare Professionals? */}
            <AccordionItem value="item-12" className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-4">
              <AccordionTrigger className="text-lg font-semibold text-slate-900">
                How Can Providers Benefit from Engaging with Aspiring Healthcare Professionals?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
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
              <Button className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </>
  );
};

export default ProviderFAQPage;
