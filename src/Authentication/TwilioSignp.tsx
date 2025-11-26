"use client";

import React, { useEffect, useMemo } from "react";
import { SignUp, GoogleOneTap } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function TwilioSignup() {
  const searchParams = useSearchParams();

  // Safely extract and decode all params
  const getParam = (key: string): string | null => {
    const value = searchParams.get(key);
    if (!value) return null;
    try {
      return decodeURIComponent(value).trim() || null;
    } catch {
      return value.trim() || null;
    }
  };

  const email = getParam("email")?.toLowerCase() || null;
  const tempHash = getParam("temp_hash") || null;
  const twilioId = getParam("twilioId") || null;
  const zipcode = getParam("zipcode") || null;

  // Build unsafeMetadata — only include truthy values
  const unsafeMetadata = useMemo(() => {
    const meta: Record<string, any> = {
      role: "provider",
      apply_metadata: true,
      from_twilio: true,
      signup_route: "twilio_invite",
    };

    if (email) meta.email = email;
    if (tempHash) meta.temp_hash = tempHash;
    if (twilioId) meta.twilioId = twilioId;
    if (zipcode) meta.zipcode = zipcode;

    return meta;
  }, [email, tempHash, twilioId, zipcode]);
  console.log(unsafeMetadata)
  // Debug log (remove in prod if needed)
  useEffect(() => {
    console.log("Twilio Invite Detected:", { email, tempHash, twilioId, zipcode });
    console.log("unsafeMetadata sent to Clerk:", unsafeMetadata);
  }, [unsafeMetadata]);

  console.log(unsafeMetadata)
  return (
     <div className="w-full min-h-screen bg-gray-100 dark:bg-inherit">
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

        {/* Sign up card */}
        <section className="py-2 max-w-lg absolute inset-x-0 z-10 mx-auto">
          <div className="mx-4">
            <SignUp
              unsafeMetadata={unsafeMetadata}
              afterSignUpUrl="/provider/jobs/all"
              afterSignInUrl="/provider/jobs/all"
              forceRedirectUrl="/provider/jobs/all"
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
            />
            <GoogleOneTap />
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
  );
}
