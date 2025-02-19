// app/explorers-faq/page.tsx
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

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQs) for Explorers | Kinscare",
  description:
    "Discover how Kinscare helps individuals explore nursing and allied healthcare careers, learn about training programs, job prospects, and more.",
};

const ExplorerFAQPage: React.FC = () => {
  return (
    <>
      <Navbar />

      <div className="mt-10">
        <div className="max-w-6xl py-20 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="p-4 border border-gray-300 mb-6 text-center rounded-lg bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-900">
              Frequently Asked Questions (FAQs) for Explorers
            </h1>
          </div>

          {/* Accordion FAQ */}
          <Accordion type="single" collapsible>
            {/* 1. What are Kinscare’s goals? */}
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                What are Kinscare’s goals?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  Kinscare aims to connect individuals interested in nursing and
                  allied healthcare with the resources they need to explore, enter,
                  and advance in these professions. Our goal is to provide clear,
                  up-to-date information about career pathways, training programs,
                  and job opportunities.
                </p>
                <p className="mt-2 text-base">
                  Beyond information, we hope to build a supportive community where
                  users can share insights, experiences, and encouragement. As this
                  community grows, employers may engage by posting job
                  opportunities, hosting job fairs, offering tuition support, or
                  providing clinical training opportunities for those looking to
                  enter the field.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 2. How can Kinscare help me explore healthcare careers? */}
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                How can Kinscare help me explore healthcare careers?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  Kinscare provides personalized guidance to help you discover which
                  nursing or allied healthcare profession aligns with your interests,
                  skills, and goals. We offer:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Access to local colleges and universities with programs in
                    nursing and allied healthcare.
                  </li>
                  <li>
                    Information on admission requirements, tuition costs, and
                    training timelines.
                  </li>
                  <li>
                    Real-world insights from professionals who have walked the same
                    path.
                  </li>
                  <li>
                    A chat feature to help you explore different career options
                    interactively.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Why does Kinscare focus on nursing and allied healthcare professions? */}
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                Why does Kinscare focus on nursing and allied healthcare professions?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  We focus on nursing and allied healthcare professions because these
                  careers offer:
                </p>
                <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
                  <li>
                    <strong>High Job Demand:</strong> According to the U.S. Bureau
                    of Labor Statistics (BLS), employment of registered nurses (RNs)
                    is projected to grow 6% from 2022 to 2032, adding about 193,100
                    new jobs per year. Allied healthcare professions, such as medical
                    assistants and respiratory therapists, are expected to grow even
                    faster, with some exceeding 20% growth over the next decade.
                  </li>
                  <li>
                    <strong>Competitive Salaries:</strong> Healthcare jobs often pay
                    above-average wages. For example, in Oregon and Washington:
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>
                        Certified Nursing Assistants (CNAs): $37,000–$45,000 per year
                      </li>
                      <li>
                        Licensed Practical Nurses (LPNs): $55,000–$65,000 per year
                      </li>
                      <li>
                        Registered Nurses (RNs): $85,000–$110,000 per year
                      </li>
                      <li>
                        Bachelor of Science in Nursing (BSN) nurses: $90,000–$120,000
                        per year
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Job Security &amp; Stability:</strong> Healthcare roles
                    are resistant to automation and AI-driven job losses. Unlike
                    industries where robots and software replace workers, patient
                    care requires human empathy, judgment, and hands-on skills that
                    technology cannot fully replicate.
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            {/* 4. I don’t have a healthcare background... */}
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                I don’t have a healthcare background. Can I still pursue a career in
                allied healthcare or nursing?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  Absolutely! You do not need prior healthcare experience to enter
                  the field. However, most nursing and allied healthcare training
                  programs require or strongly prefer applicants with direct patient
                  care experience.
                </p>
                <p className="mt-2">
                  The easiest way to gain this experience is by working as a
                  Certified Nursing Assistant (CNA), a home care aide (HCA), or in
                  another entry-level healthcare role. This not only strengthens your
                  application but also gives you a firsthand look at patient care
                  before committing to a long-term healthcare career.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 5. How do I know which healthcare career is right for me? */}
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                How do I know which healthcare career is right for me?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  Choosing the right career depends on your interests, personality,
                  and long-term goals. Start by using Kinscare’s chat feature to
                  explore different career paths. Here are some factors to consider:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Do you prefer working hands-on with patients? → Nursing,
                    physical therapy, or respiratory therapy may be a good fit.
                  </li>
                  <li>
                    Do you enjoy technology and problem-solving? → Consider
                    radiologic technology or clinical laboratory science.
                  </li>
                  <li>
                    Are you interested in mental health? → Explore social work,
                    psychiatric nursing, or behavioral therapy.
                  </li>
                </ul>
                <p className="mt-2">
                  Many healthcare careers offer progressive advancement. For
                  example, you can start as a CNA → LPN → RN → BSN → Nurse
                  Practitioner (NP). You can also cross-train in multiple fields,
                  such as combining nursing with social work or respiratory
                  therapy, increasing your earning potential and career flexibility.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 6. What qualifications do I need... */}
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                What qualifications do I need to start a career in nursing or allied
                healthcare?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  The minimum qualifications vary widely depending on the career
                  path:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                  <li>
                    <strong>Certified Nursing Assistant (CNA):</strong> Must be able
                    to read, write, and lift 50 pounds. Training lasts 4–6 weeks.
                  </li>
                  <li>
                    <strong>Licensed Practical Nurse (LPN):</strong> Requires a high
                    school diploma or GED and 9–12 months of training.
                  </li>
                  <li>
                    <strong>Registered Nurse (RN):</strong> Requires either an
                    Associate Degree in Nursing (ADN) (2 years) or a Bachelor of
                    Science in Nursing (BSN) (4 years).
                  </li>
                  <li>
                    <strong>Allied Healthcare Professions:</strong> Training ranges
                    from a few months (e.g., medical assistant, phlebotomist) to 4+
                    years (e.g., physical therapist, physician assistant).
                  </li>
                  <li>
                    <strong>Physicians:</strong> Require 12+ years of post-high
                    school education, including medical school and residency.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 7. Can I cross-train or combine different healthcare roles? */}
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold">
                Can I cross-train or combine different healthcare roles?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  Yes! While not common, cross-training in multiple healthcare fields
                  can make you more versatile and increase your earning potential.
                </p>
                <p className="mt-2">
                  For example:
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>
                      A registered nurse (RN) with respiratory therapy training can
                      work in critical care units where both skill sets are valuable.
                    </li>
                    <li>
                      A nurse with a social work background can specialize in case
                      management, mental health, or community health programs.
                    </li>
                  </ul>
                </p>
                <p className="mt-2">
                  By holding multiple certifications, employers may rely on you to
                  perform tasks that otherwise require two separate professionals,
                  making you a more attractive hire.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 8. How can I transfer my foreign nursing or healthcare license...? */}
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold">
                How can I transfer my foreign nursing or healthcare license to
                Washington or Oregon?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  If you have a foreign healthcare license, you may apply for
                  license endorsement in Washington or Oregon. The process includes:
                </p>
                <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
                  <li>
                    <strong>Transcript Evaluation:</strong> Have your academic
                    credentials assessed by an approved evaluation service.
                  </li>
                  <li>
                    <strong>English Proficiency Exam:</strong> If your primary
                    language is not English, you may need to take the TOEFL or
                    IELTS.
                  </li>
                  <li>
                    <strong>NCLEX Exam:</strong> Foreign-trained nurses must pass
                    the NCLEX-RN to receive U.S. licensure.
                  </li>
                  <li>
                    <strong>Gaining U.S. Work Experience:</strong> Some states
                    recommend gaining hands-on experience in a U.S. healthcare
                    setting before completing your licensing process.
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            {/* 9. Where can I find schools or training programs near me? */}
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-semibold">
                Where can I find schools or training programs near me?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  Use Kinscare’s chat feature to discover nearby colleges and
                  universities offering nursing and allied healthcare programs. You
                  can explore program details, tuition costs, admission deadlines,
                  and more.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 10. What are the job prospects...? */}
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-lg font-semibold">
                What are the job prospects for nursing and allied healthcare
                professionals?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  The healthcare industry is one of the fastest-growing sectors in
                  the U.S. due to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong>Aging Population:</strong> By 2030, 1 in 5 Americans
                    will be over 65, increasing demand for healthcare workers.
                  </li>
                  <li>
                    <strong>Retiring Workforce:</strong> More than 500,000 nurses
                    are expected to retire by 2030, creating urgent job openings.
                  </li>
                  <li>
                    <strong>Rising Chronic Diseases:</strong> Obesity, diabetes, and
                    heart disease continue to rise, requiring more healthcare
                    services.
                  </li>
                </ul>
                <p className="mt-2">
                  This means strong job security and growing career opportunities in
                  healthcare.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* 11. How can I start applying for healthcare training programs? */}
            <AccordionItem value="item-11">
              <AccordionTrigger className="text-lg font-semibold">
                How can I start applying for healthcare training programs?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">By joining Kinscare, you can:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Stay updated on information sessions and application deadlines.
                  </li>
                  <li>Learn from others who have gone through the process.</li>
                  <li>
                    Get guidance on financial aid, scholarships, and admission
                    requirements.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* 12. What are the career advancement opportunities in healthcare? */}
            <AccordionItem value="item-12">
              <AccordionTrigger className="text-lg font-semibold">
                What are the career advancement opportunities in healthcare?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base">
                  Healthcare offers multiple paths for career growth, including:
                </p>
                <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
                  <li>
                    <strong>Clinical Advancement:</strong> Move from CNA → LPN →
                    RN → BSN → Nurse Practitioner (NP) or Physician Assistant (PA).
                  </li>
                  <li>
                    <strong>Specialization:</strong> Become a specialist in areas
                    like pediatrics, oncology, anesthesiology, or critical care.
                  </li>
                  <li>
                    <strong>Leadership Roles:</strong> Advance into management
                    positions such as nurse manager, hospital administrator, or
                    director of nursing.
                  </li>
                  <li>
                    <strong>Education &amp; Research:</strong> Become a nursing
                    professor, clinical educator, or medical researcher.
                  </li>
                </ol>
                <p className="mt-2">
                  With continuous learning and certifications, you can increase your
                  salary, job flexibility, and career longevity in the healthcare
                  field.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Example CTA Button or Additional Links */}
          <div className="mt-8">
            <Link href="/explore-careers">
              <Button className="w-full">Explore Careers</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ExplorerFAQPage;
