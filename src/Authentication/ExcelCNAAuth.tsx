"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

const ExcelCNASignupPage: React.FC = () => {
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
  // console.log(unsafeMetadata)
  return (
    <>
      {/* Header + Page Shell */}
      <div className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto w-full max-w-[28rem] sm:max-w-xl">
          {/* Top header */}
          <header className="py-1 sm:py-2">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
              >
                <Image
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                  alt="KinsCare logo"
                />
                <span className="text-slate-900 dark:text-slate-100 tracking-tight">
                  Kinscare
                </span>
              </Link>

              <div className="hidden sm:flex items-center gap-3">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Already have an account?
                </p>
                <Link href="/signin">
                  <Button className="shadow-2xl">Signin</Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg sm:shadow-xl mt-4">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-40 w-40 rounded-full bg-indigo-100/70 dark:bg-indigo-900/20 blur-xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-36 w-36 rounded-full bg-blue-100/60 dark:bg-blue-900/20 blur-xl" />

            <div className="relative z-10 p-5 sm:p-8">
              {/* Title */}
              <div className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Excel CNA Students – Join Kinscare
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  Create your caregiver account using the email you registered
                  with at Excel CNA so we can unlock your full KinsCare access.
                </p>
              </div>

              {/* Clerk SignUp with unsafeMetadata + custom appearance */}
              <SignUp
                unsafeMetadata={unsafeMetadata}
                afterSignUpUrl="/vitae/jobs/all"
                afterSignInUrl="/vitae/jobs/all"
                forceRedirectUrl="/vitae/jobs/all"
                appearance={{
                  elements: {
                    formButtonPrimary:
                      "bg-blue-600 shadow-xl border-none hover:bg-blue-500",
                    card: "border-gray-200 gap-3",
                    // Outer wrapper (full width, centers the card)
                    rootBox: "flex justify-center w-full px-2 sm:px-4",
                    main: "gap-3",
                    // The actual card container
                    cardBox:
                      "w-full max-w-lg bg-white shadow-xl rounded-2xl border border-gray-100 transition-all",
                  },
                }}
              />
            </div>
          </div>

          {/* Safe area bottom padding for mobile */}
          <div className="h-6 sm:h-8" />
        </div>
      </div>
    </>
  );
};

export default ExcelCNASignupPage;
