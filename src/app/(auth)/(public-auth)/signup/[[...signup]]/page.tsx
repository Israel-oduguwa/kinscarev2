import { Button } from "@/components/ui/button";
import { GoogleOneTap, SignUp } from "@clerk/nextjs";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
// Define Metadata for SEO
export const metadata: Metadata = {
  title: "Create Your Account | Join Kinscare Today",
  description:
    "Sign up for Kinscare to access personalized care services, caregiver opportunities, and healthcare provider tools. Quick and secure registration.",
  keywords: [
    "Kinscare Signup",
    "Create Account Kinscare",
    "Caregiver Registration",
    "Healthcare Provider Account",
    "Kinscare Account",
  ],
  openGraph: {
    title: "Create Your Account | Join Kinscare Today",
    description:
      "Sign up to join Kinscare and access personalized caregiver services and healthcare tools.",
    url: "https://www.kinscare.com/signup",
    siteName: "Kinscare",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
        width: 1200,
        height: 630,
        alt: "Kinscare Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Your Account | Join Kinscare Today",
    description:
      "Sign up for Kinscare and get started with personalized caregiver services.",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.kinscare.com/signup",
  },
};

function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Signup for Kinscare",
    description:
      "Create your Kinscare account to access caregiving opportunities, healthcare provider tools, and personalized services.",
    url: "https://www.kinscare.com/signup",
    publisher: {
      "@type": "Organization",
      name: "Kinscare",
      logo: {
        "@type": "ImageObject",
        url: "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
        width: 500,
        height: 500,
      },
    },
  };

  return (
    <>
      {/* Add JSON-LD for structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full min-h-[100vh] bg-gray-100 dark:bg-inherit">
        {/* Role selection modal (shown after Google signup if role missing) */}
        {/* Header */}
        <header className="py-6 px-6 sm:py-4 xl:pb-8">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center text-lg font-semibold text-gray-900 dark:text-white"
            >
              <Image
                width={12}
                height={12}
                className="w-12 mr-2"
                src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                alt="logo"
              />
              <p className="font-bold text-sm text-slate-900 tracking-tight">
                Kinscare
              </p>
            </Link>
            <div className="flex justify-between gap-6 items-center">
              <p className="text-md text-gray-800 antialiased hidden md:block">
                Already have an account?
              </p>
              <Link href="/signin">
                <Button className="shadow-2xl">Signin</Button>
              </Link>
            </div>
          </div>
        </header>
        <section className="py-2 max-w-lg absolute inset-x-0 z-10 mx-auto">
          <div className="mx-4">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-blue-600 shadow-xl border-none hover:bg-blue-500",
                  card: "border-gray-200 gap-3",
                  // Outer wrapper (full width, centers the card)
                  rootBox: "flex justify-center w-full px-4",
                  main: "gap-3",
                  // The actual card container
                  cardBox:
                    "w-full max-w-lg bg-white shadow-xl rounded-2xl border border-gray-100 transition-all",
                },
              }}
              redirectUrl="/onboarding"
              afterSignUpUrl="/onboarding"
              afterSignInUrl="/after-sign-in"
            />
            <GoogleOneTap/>
            {/* Terms & Privacy */}
            {/* <div>
              <p className="text-gray-500 text-xs">
                By clicking &quot;Create an account&quot;, you agree to our{" "}
                <Link className="text-blue-600" href="/terms">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link className="text-blue-600" href="/privacy">
                  Privacy Policy
                </Link>
              </p>
            </div> */}
          </div>
        </section>
        {/* Decorative SVG bottom wave */}
        <div className="absolute bottom-0 -z-0 left-0 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gradient2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6a11cb" />
                <stop offset="100%" stopColor="#2575fc" />
              </linearGradient>
            </defs>
            <path
              fill="url(#gradient2)"
              fillOpacity="1"
              d="M0,320L48,304C96,288,192,256,288,245.3C384,235,480,245,576,224C672,203,768,149,864,133.3C960,117,1056,139,1152,128C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>
    </>
  );
}

export default Page;
