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
    description:
      "Perfect for short-term projects or temporary needs. Get access for 24 hours.",
    features: [
      "24-hour access",
      "Full feature set",
      "Priority support during active period",
    ],
  },
  {
    id: "weekly",
    title: "Weekly Plan",
    price: "$63.99",
    stripePriceId: "price_1QSCneAoahxG9SLGCHhFdN4C",
    description:
      "Ideal for weekly usage. Enjoy full access for 7 days at a discounted rate.",
    features: ["7-day access", "Full feature set", "Priority email support"],
  },
  {
    id: "monthly",
    title: "Monthly Plan",
    price: "$93.99",
    stripePriceId: "price_1QXcpZAoahxG9SLGjWJp4KfP",
    description: "Best value! Get 30 days of unlimited access to all features.",
    features: ["30-day access", "Full feature set", "24/7 premium support"],
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
                <p className="text-[hsl(var(--muted-foreground))] mt-4">
                  {plan.description}
                </p>
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
        <div className="bg-[hsl(var(--secondary))] rounded-[var(--radius)] p-6 shadow-sm">
          <p className="text-sm text-[hsl(var(--secondary-foreground))] text-center">
            Kinscare is like Uber (pay for use) and is NOT like Netflix
            (subscription). That is, Kinscare is NOT a subscription but is a
            pay-for-use service.
          </p>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
