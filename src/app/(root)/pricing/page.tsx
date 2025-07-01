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
    stripePriceId: "price_1QXcozAoahxG9SLGGelfYlKJ",
    highlight: "Try risk-free",
    best: "Exploring caregivers before committing",
    description: `Best for exploring caregivers before committing or temporary needs. Get access for 24 hours.`,
    features: [
      "24-hour access",
      "Full feature set",
      "Email support during active period",
    ],
  },
  {
    id: "weekly",
    title: "Weekly Plan",
    best: "",
    price: "$63.99",
    stripePriceId: "price_1QSCneAoahxG9SLGCHhFdN4C",
    highlight: "Most Popular",
    description:
      "Ideal for weekly usage. Enjoy full access for 7 days at a discounted rate.",
    features: [
      "7-day access",
      "Full feature set",
      "Email support during active period",
    ],
  },
  {
    id: "monthly",
    title: "Monthly Plan",
    best: "",
    highlight: "Best Value",
    price: "$93.99",
    stripePriceId: "price_1QXcpZAoahxG9SLGjWJp4KfP",
    description:
      "Best value! Get 30 days of unlimited access to all features. for Ongoing hiring & workforce planning",
    features: [
      "30-day access",
      "Full feature set",
      "Email support during active period",
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen mt-10 bg-[hsl(var(--background))] flex flex-col">
     
      <div className="max-w-screen-xl mx-auto space-y-16 px-6 lg:px-16 py-12">
        {/* Header Section */}

        <div className="text-center lg:pt-14  mb-16">
          <span className="inline-block mb-3 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-100 text-blue-600 shadow">
            Transparent Pricing
          </span>
          <h1 className="text-6xl font-extrabold text-gray-700">
            Find the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
              right caregiver
            </span>{" "}
            for you!
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] mt-4 max-w-2xl mx-auto">
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
                  group relative flex-1 min-w-[280px] max-w-xs bg-white/70 backdrop-blur-lg border border-gray-200
                  rounded-3xl shadow-xl px-7 py-10 transition-all duration-300
                  hover:scale-105 hover:shadow-2xl hover:border-blue-400
                  ${plan.id === "monthly" ? "ring-2 ring-blue-400" : ""}
                `}
              >
                {plan.highlight && (
                  <div className={`
                    absolute -top-5 left-1/2 -translate-x-1/2
                    flex items-center gap-1 px-4 py-1 rounded-full font-medium text-xs
                    ${plan.id === "monthly" ? "bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-md" : "bg-blue-100 text-blue-600"}
                  `}>
                    {plan.id === "monthly" && <Star size={16} className="mr-1" />}
                    {plan.highlight}
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-gray-800">{plan.title}</h3>
                <div className="flex items-baseline justify-center mb-5">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="ml-2 text-sm text-gray-400 font-medium">/plan</span>
                </div>
                <p className="text-gray-600 text-base mb-5">{plan.description}</p>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="text-blue-500 w-4 h-4" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <PricingButton plan={plan.stripePriceId}>
                  <Button
                    className={`
                      w-full py-3 rounded-xl text-lg font-bold shadow
                      ${plan.id === "monthly"
                        ? "bg-gradient-to-r from-blue-600 to-pink-500 text-white hover:from-pink-500 hover:to-blue-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"}
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
        <div className="max-w-screen-xl mx-auto space-y-6 px-6 lg:px-16 py-10">
          {/* Every Plan Includes */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
              Every Plan Includes
            </h2>
            <ul className="space-y-2 text-lg">
              <li className="flex items-start gap-4 py-4 rounded-[var(--radius)]  transition-colors duration-200">
                <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
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
              <li className="flex items-start gap-4 py-4 rounded-[var(--radius)]  transition-colors duration-200">
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
              <li className="flex items-start gap-4 py-4 rounded-[var(--radius)]  transition-colors duration-200">
                <div className="shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-600"
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
              <li className="flex items-start gap-4 py-4 rounded-[var(--radius)]  transition-colors duration-200">
                <div className="shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-pink-600"
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
          <div className="bg-[hsl(var(--secondary))] p-8 rounded-[var(--radius)]">
            <h2 className="text-3xl font-bold mb-4">
              Why Direct Contact Matters
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6">
              Tired of interview no-shows? When you can't communicate directly
              with candidates, it's hard to confirm appointments, follow up, or
              assess real interest.
            </p>
            <p className="text-lg text-[hsl(var(--muted-foreground))]">
              With KinsCare, you contact caregivers directly—no middlemen, no
              scheduling barriers. This means fewer no-shows and better hiring
              outcomes.
            </p>
          </div>

          {/* Cancel Anytime */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 p-8 rounded-[var(--radius)]">
            <h2 className="text-3xl font-bold mb-4">
              Cancel Anytime – No Auto-Renewals
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6">
              KinsCare is like Uber: you pay for access only when you need it.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-[hsl(var(--muted-foreground))]">
              <li>No long-term commitments</li>
              <li>No automatic renewals</li>
              <li>Start and stop whenever hiring needs arise</li>
            </ul>
          </div>

          {/* FAQs */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">
              💡 Still have questions? Here's what providers want to know:
            </h2>
            <div className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold">
                  Q: What happens when my plan expires?
                </h3>
                <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                  A: Your access ends, but you can renew anytime.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold">
                  Q: Does KinsCare handle hiring and vetting caregivers?
                </h3>
                <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                  A: No, KinsCare is not a staffing agency. You contact and
                  recruit caregivers directly.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold">
                  Q: Can I hire caregivers for different job types?
                </h3>
                <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                  A: Yes! Find caregivers for full-time, part-time, live-in,
                  on-call, or weekend shifts.
                </p>
              </div>
              <div className="pb-6">
                <h3 className="text-xl font-semibold">
                  Q: Can I cancel my plan?
                </h3>
                <p className="mt-2 text-[hsl(var(--muted-foreground))]">
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
