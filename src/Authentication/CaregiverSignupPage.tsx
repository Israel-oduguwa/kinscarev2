/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { SignUp } from "@clerk/nextjs";
import axios from "axios";
import { BadgeCheck, HeartHandshake, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CaregiverSignupPage() {
  const searchParams = useSearchParams();
  const [unsafeMetadata, setUnsafeMetadata] = useState<any>({
    route: "excel_cna",
    source: "excel-cna",
    role: "caregiver",
    apply_metadata: true,
    returning: false,
  });

  useEffect(() => {
    const buildMetadata = async () => {
      let baseMeta: any = {
        route: "excel_cna",
        source: "excel-cna",
        role: "caregiver",
        apply_metadata: true,
        returning: false,
      };

      // 2) Fallback to raw URL params if present
      const urlKeys = ["fname", "lname", "email", "tel", "role"];
      urlKeys.forEach((key) => {
        const val = searchParams.get(key);
        if (val) {
          baseMeta[`prefill_${key}`] = val;
        }
      });

      // 3) IP + geo data from /api/ip
      try {
        const res = await axios.get("/api/ip");
        const data = res?.data || {};
        const {
          ip,
          city,
          latitude,
          longitude,
          country_code,
          region_name,
          zip,
        } = data;

        baseMeta.userIp = ip;
        baseMeta.zipcode = zip;
        baseMeta.city = city || baseMeta.city;
        baseMeta.address =
          city && region_name && country_code
            ? `${city}, ${region_name}, ${country_code}`
            : baseMeta.address;

        if (
          typeof latitude === "number" &&
          !Number.isNaN(latitude) &&
          typeof longitude === "number" &&
          !Number.isNaN(longitude)
        ) {
          baseMeta.geocode_address = { lng: longitude, lat: latitude };
        }
      } catch (err) {
        console.error("Failed to fetch IP info for Excel CNA signup:", err);
      }

      setUnsafeMetadata(baseMeta);
    };

    buildMetadata();
  }, [searchParams]);
  console.log(unsafeMetadata);
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 dark:from-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <header className="py-5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1 group">
            <div className=" dark:bg-neutral-800  rounded-xlgroup-hover:shadow-md transition-all">
              <Image
                width={40}
                height={40}
                className="w-10 h-10"
                src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                alt="KinsCare logo"
              />
            </div>
            <span className="font-bold tracking-tight">KinsCare</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
              Already have an account?
            </span>
            <Link href="/signin">
              <Button className="shadow bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-500/20 blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl"></div>

              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Build Your Caregiving Career
                </h1>
                <p className="mt-3 text-blue-100 max-w-lg">
                  Join thousands of caregivers finding meaningful work on
                  KinsCare. It&apos;s free to sign up, apply, and message
                  employers. Get matched to roles that fit your skills and
                  availability.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <BadgeCheck className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-200" />
                  <div>
                    <h3 className="font-medium">Verified Facilities</h3>
                    <p className="text-sm text-blue-100 mt-1">
                      Only licensed and vetted care centers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <ShieldCheck className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-200" />
                  <div>
                    <h3 className="font-medium">No Fees for Caregivers</h3>
                    <p className="text-sm text-blue-100 mt-1">
                      Apply and get hired—KinsCare is free for caregivers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <HeartHandshake className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-200" />
                  <div>
                    <h3 className="font-medium">Supportive Community</h3>
                    <p className="text-sm text-blue-100 mt-1">
                      Connect with fellow caregivers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <Star className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-200" />
                  <div>
                    <h3 className="font-medium">Priority Matching</h3>
                    <p className="text-sm text-blue-100 mt-1">
                      Get recommended for top roles
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray to-gray-900 dark:via-neutral-900/80 dark:to-neutral-900 z-10"></div>
              <Image
                src="https://images.unsplash.com/photo-1612277795009-f95f2e8c4a02?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Caregiver at work"
                width={1200}
                height={800}
                className="rounded-2xl shadow-lg object-cover w-full h-64"
              />
              <div className="absolute bottom-4 left-4 bg-white dark:bg-neutral-800 px-4 py-2 rounded-xl shadow-md z-20">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  &quot;KinsCare helped me find work that fits my schedule and
                  values&quot;
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  — Maria, Caregiver since 2022
                </p>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div>
            <SignUp
              // All the important context for your backend:
              unsafeMetadata={unsafeMetadata}
              // Redirects after successful signup/signin
              afterSignUpUrl="/vitae/jobs/all"
              afterSignInUrl="/vitae/jobs/all"
              forceRedirectUrl="/vitae/jobs/all"

              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-blue-600 shadow-xl border-none hover:bg-blue-500",
                  card: "border-gray-200 gap-3",
                  rootBox: "flex justify-center w-full px-0",
                  main: "gap-3",
                  cardBox:
                    "w-full max-w-md bg-white shadow-xl rounded-2xl border border-gray-100 transition-all",
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-6 bg-gradient-to-b from-white to-indigo-50 dark:from-neutral-900 dark:to-neutral-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Why Caregivers Choose KinsCare
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Smart Job Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our algorithm matches you with roles that fit your
                qualifications, schedule, and preferences.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Fees — Ever
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Caregivers never pay to use KinsCare. Apply, chat, and get hired
                at no cost.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Competitive Pay
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Find roles with clear pay rates and transparent expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
}
