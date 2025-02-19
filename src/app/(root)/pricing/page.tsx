import PricingButton from "@/Authentication/PricingButton";
import { Button } from "@/components/ui/button";
import Footer from "@/WebPages/Footer";
import NavBar from "@/WebPages/Navbar";
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
    url: "https://www.kinscare.com/pricing",
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
      <NavBar />
      <div className="max-w-screen-xl mx-auto space-y-16 px-6 lg:px-16 py-12">
        {/* Header Section */}
        <div className="text-center lg:pt-14  mb-16">
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
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className="relative bg-[hsl(var(--card))] shadow-lg rounded-[var(--radius)] overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-2"
            >
              {/* Accent Bar */}
              <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] h-2"></div>

              {/* Plan Details */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[hsl(var(--card-foreground))]">
                  {plan.title}
                </h3>
                <p className="text-4xl font-extrabold text-[hsl(var(--foreground))] mt-4">
                  {plan.price}
                </p>
                <p className="text-gray-600 mt-4">{plan.description}</p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-[hsl(var(--card-foreground))] space-x-2"
                    >
                      <svg
                        className="w-5 h-5 text-[hsl(var(--chart-2))]"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 17.414l-5.707-5.707 1.414-1.414L10 14.586l8.293-8.293 1.414 1.414z" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <PricingButton plan={plan.stripePriceId}>
                  <Button className="mt-8 w-full py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium rounded-[var(--radius)] hover:bg-[hsl(var(--primary))]">
                    Get started
                  </Button>
                </PricingButton>
              </div>
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
      <Footer />
    </div>
  );
}
