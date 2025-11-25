/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { SignUp } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

const EmployerJoin: React.FC = () => {
  const [unsafeMetadata, setUnsafeMetadata] = useState<any>({
    role: "provider",
    apply_metadata: true,
    returning: false,
  });

  useEffect(() => {
    const fetchIpData = async () => {
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

        setUnsafeMetadata((prev: any) => ({
          ...prev,
          userIp: ip,
          zipcode: zip,
          address:
            city && region_name && country_code
              ? `${city}, ${region_name}, ${country_code}`
              : prev.address,
          geocode_address:
            typeof latitude === "number" && typeof longitude === "number"
              ? { lng: longitude, lat: latitude }
              : prev.geocode_address,
          city: city || prev.city,
        }));
      } catch (error) {
        console.error("Failed to fetch IP info for signup metadata", error);
      }
    };

    fetchIpData();
  }, []);

  return (
    <div className="w-full min-h-[100vh] bg-gray-100 dark:bg-inherit">
      {/* Header */}
      <header className="py-6 px-6 sm:py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link
              href="/"
              className="flex items-center text-lg font-semibold text-gray-900 dark:text-white"
            >
              <Image
                width={40}
                height={40}
                className="w-12 mr-2"
                src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                alt="logo"
              />
              <p className="font-bold text-sm text-slate-900 tracking-tight">
                Kinscare
              </p>
            </Link>
          </div>
          <div>
            <div className="flex justify-between gap-6 items-center">
              <p className="text-md text-gray-800 antialiased hidden md:block">
                Already have an account?
              </p>
              <Link href="/signin">
                <Button className="shadow-2xl">Signin</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main card */}
      <section className="py-6 max-w-xl absolute right-0 left-0 z-10 m-auto">
        <div className="mx-4">
          <div >
            <div>
             
              {/* Clerk SignUp with unsafeMetadata + custom appearance */}
              <SignUp
                unsafeMetadata={unsafeMetadata}
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
            </div>
          </div>
        </div>
      </section>

      {/* Bottom gradient wave */}
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
};

export default EmployerJoin;
