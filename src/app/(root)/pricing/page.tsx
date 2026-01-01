/* eslint-disable react/no-unescaped-entities */
import PricingButton from "@/Authentication/PricingButton";
import { Button } from "@/components/ui/button";
import Footer from "@/WebPages/Footer";
import NavBar from "@/WebPages/Navbar";
import { CheckCircle, Star } from "lucide-react";
import { features } from "node:process";

export const metadata = {
  title: "Get qualifed Caregivers at Affordable Price - Kinscare",
  description:
    "Explore our affordable pricing plans for caregivers and providers. Choose from daily, weekly, or monthly subscriptions to meet your needs.",
  keywords: [
    "Caregivers",
    "Subscription Plans",
    "Pricing",
    "Kinscare",
    "Daily Plan",
    "Weekly Plan",
    "Monthly Plan",
  ],
  openGraph: {
    title: "Affordable Pricing Plans - Kinscare",
    description:
      "Explore our affordable pricing plans for caregivers and providers. Choose from daily, weekly, or monthly subscriptions to meet your needs.",
    url: "https://www.kinscare.org/pricing",
    siteName: "Kinscare",
    images: [
      {
        url: "/path-to-pricing-social-media-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kinscare Pricing Plans",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Affordable Pricing Plans - Kinscare",
    description:
      "Explore our affordable pricing plans for caregivers and providers. Choose from daily, weekly, or monthly subscriptions to meet your needs.",
    images: ["/path-to-pricing-social-media-image.jpg"],
  },
};

const pricingPlans = [
  {
    id: "daily",
    title: "Daily Plan",
    price: "$23.99",
    stripePriceId: "price_1SG0IIAoahxG9SLGjs1ME0zJ",
    highlight: "Try risk-free",
    best: "Exploring caregivers before committing",
    description: `Best for exploring caregivers before committing or temporary needs. Get access for 24 hours.`,
    features: [
      "24-hour access",
      "Full feature set",
      "Active support during active period",
    ],
  },
  {
    id: "weekly",
    title: "Weekly Plan",
    best: "",
    price: "$63.99",
    stripePriceId: "price_1SG0IIAoahxG9SLGW3iCYQpb",
    highlight: "Most Popular",
    description:
      "Ideal for weekly usage. Enjoy full access for 7 days at a discounted rate.",
    features: [
      "7-day access",
      "Full feature set",
      "Active support during active period",
    ],
  },
  {
    id: "monthly",
    title: "Monthly Plan",
    best: "",
    highlight: "Best Value",
    price: "$93.99",
    stripePriceId: "price_1SG0FJAoahxG9SLG2zl4tRUp",
    description:
      "Best value! Get 30 days of unlimited access to all features. for Ongoing hiring & workforce planning",
    features: [
      "30-day access",
      "Full feature set",
      "Active support during active period",
    ],
  },
];

const faqs = [
  {
    q: "What happens when my plan expires?",
    a: "Your access ends, but you can renew anytime.",
  },
  {
    q: "Does KinsCare handle hiring and vetting caregivers?",
    a: "No, KinsCare is not a staffing agency. You contact and recruit caregivers directly.",
  },
  {
    q: "Can I hire caregivers for different job types?",
    a: "Yes! Find caregivers for full-time, part-time, live-in, on-call, or weekend shifts.",
  },
  {
    q: "Can I cancel my plan?",
    a: "Yes! There are no contracts, and you can cancel anytime.",
  },
];
export default function Pricing() {
  return (
    <div className="relative min-h-screen bg-slate-950/5 flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(59,130,246,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_20%,rgba(30,64,175,0.12),transparent_60%)]" />
        <div className="absolute -top-24 right-6 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:36px_36px] opacity-35" />
      </div>
      <div className="relative max-w-screen-xl mx-auto space-y-16 px-6 lg:px-16 py-12">
        {/* Header Section */}

        <div className="text-center mt-20 lg:pt-14 mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-4">
            Transparent Pricing
          </p>
          <h1 className="text-4xl md:text-6xl font-[family:var(--header-font)] font-extrabold text-slate-900">
            Find the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-500">
              right caregiver
            </span>{" "}
            for you!
          </h1>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
            Find local caregivers near you looking for full-time, part-time,
            live-in, weekends, and overnight jobs. Our caregivers have CNA, HCA,
            or NAR licenses. Get started for free, no credit card required.
          </p>
        </div>
        {/* Pricing Plans Section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center items-center max-w-7xl mx-auto mt-12">
          {pricingPlans.map((plan, i) => (
            <div
              key={plan.id}
              className={`
                  group relative flex-1 min-w-[280px] max-w-xs bg-white/80 backdrop-blur-xl border border-white/70
                  rounded-3xl shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] px-7 py-10 transition-all duration-300
                  hover:scale-105 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] hover:border-blue-300
                  ${plan.id === "monthly" ? "ring-2 ring-blue-400/60" : ""}
                `}
            >
              {plan.highlight && (
                <div
                  className={`
                    absolute -top-5 left-1/2 -translate-x-1/2
                    flex items-center gap-1 px-4 py-1 rounded-full font-medium text-xs
                    ${
                      plan.id === "monthly"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-blue-100 text-blue-700"
                    }
                  `}
                >
                  {plan.id === "monthly" && <Star size={16} className="mr-1" />}
                  {plan.highlight}
                </div>
              )}
              <h3 className="text-2xl font-extrabold mb-2 text-slate-900">
                {plan.title}
              </h3>
              <div className="flex items-baseline justify-center mb-5">
                <span className="text-4xl font-extrabold text-slate-900">
                  {plan.price}
                </span>
                <span className="ml-2 text-sm text-slate-400 font-medium">
                  /plan
                </span>
              </div>
              <p className="text-slate-600 text-base mb-5">
                {plan.description}
              </p>
              <ul className="space-y-3 mb-7">
                {plan.features.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-slate-700"
                  >
                    <CheckCircle className="text-blue-500 w-4 h-4" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <PricingButton plan={plan.stripePriceId}>
                <Button
                  className={`
                      w-full py-3 rounded-xl text-lg font-bold shadow
                      ${
                        plan.id === "monthly"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }
                    `}
                >
                  Get Started
                </Button>
              </PricingButton>
            </div>
          ))}
        </div>
        {/* Note Section */}
        {/* <div className="bg-[hsl(var(--secondary))] rounded-[var(--radius)] p-6 shadow-sm">
          <p className="text-sm text-[hsl(var(--secondary-foreground))] text-center">
            Kinscare is like Uber (pay for use) and is NOT like Netflix
            (subscription). That is, Kinscare is NOT a subscription but is a
            pay-for-use service.
          </p>
        </div> */}
        <div className="max-w-screen-xl mx-auto space-y-6 px-6 lg:px-16">
          {/* Every Plan Includes */}
          <div className="space-y-2">
            <h2 className="text-3xl tracking-tight font-[family:var(--header-font)] font-extrabold text-slate-900">
              Every Plan Includes
            </h2>
            <ul className="text-lg">
              <li className="flex items-start gap-4 py-2 rounded-[var(--radius)]  transition-colors duration-200">
                <div className="shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Full caregiver registry access</span>
              </li>
              <li className="flex items-start gap-4 py-2 rounded-[var(--radius)]  transition-colors duration-200">
                <div className="shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <span>
                  Direct caregiver contact details – No third-party scheduling
                </span>
              </li>
              <li className="flex items-start gap-4 py-2 rounded-[var(--radius)]  transition-colors duration-200">
                <div className="shrink-0 w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <span>Instant job posting & applicant tracking</span>
              </li>
              <li className="flex items-start gap-4 py-2 rounded-[var(--radius)]  transition-colors duration-200">
                <div className="shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <span>No hidden fees, no commitments – Cancel anytime</span>
              </li>
            </ul>
          </div>
          {/* Why Direct Contact Matters */}
          <div className="bg-white/80 border border-white/70 p-8 rounded-3xl shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <h2 className="text-3xl tracking-tight font-[family:var(--header-font)] font-extrabold mb-4 text-slate-900">
              Why Direct Contact Matters
            </h2>
            <p className="text-slate-600 mb-6">
              Tired of interview no-shows? When you can't communicate directly
              with candidates, it's hard to confirm appointments, follow up, or
              assess real interest.
            </p>
            <p className="text-slate-600">
              With KinsCare, you contact caregivers directly—no middlemen, no
              scheduling barriers. This means fewer no-shows and better hiring
              outcomes.
            </p>
          </div>

          {/* Cancel Anytime */}
          <div className="bg-white/80 border border-white/70 p-8 rounded-3xl shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <h2 className="text-3xl tracking-tight font-[family:var(--header-font)] font-extrabold mb-4 text-slate-900">
              Cancel Anytime – No Auto-Renewals
            </h2>
            <p className="text-slate-600 mb-2">
              KinsCare is like Uber: you pay for access only when you need it.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-600">
              <li>No long-term commitments</li>
              <li>No automatic renewals</li>
              <li>Start and stop whenever hiring needs arise</li>
            </ul>
          </div>

          {/* FAQs */}
          <div className="space-y-8 py-10">
            <h2 className="text-3xl tracking-tight font-[family:var(--header-font)] font-extrabold text-slate-900">
              💡 Still have questions? Here's what providers want to know:
            </h2>
            <div className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  Q: What happens when my plan expires?
                </h3>
                <p className="mt-2 text-slate-600">
                  A: Your access ends, but you can renew anytime.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  Q: Does KinsCare handle hiring and vetting caregivers?
                </h3>
                <p className="mt-2 text-slate-600">
                  A: No, KinsCare is not a staffing agency. You contact and
                  recruit caregivers directly.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  Q: Can I hire caregivers for different job types?
                </h3>
                <p className="mt-2 text-slate-600">
                  A: Yes! Find caregivers for full-time, part-time, live-in,
                  on-call, or weekend shifts.
                </p>
              </div>
              <div className="pb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  Q: Can I cancel my plan?
                </h3>
                <p className="mt-2 text-slate-600">
                  A: Yes! There are no contracts, and you can cancel anytime.
                </p>
              </div>
            </div>
            {/* <div className="text-center">
              <Button variant="outline" className="px-12 py-6 text-lg">
                🔍 Need more details? Talk to Us
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
