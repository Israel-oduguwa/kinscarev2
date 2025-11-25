"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { SignUp, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface PricingButtonProps {
  plan: string;
  children: React.ReactNode;
}

function SafeTrigger({
  children,
  fallbackText = "Get Started",
}: {
  children: React.ReactNode;
  fallbackText?: string;
}) {
  if (React.isValidElement(children)) {
    return <DialogTrigger asChild>{children}</DialogTrigger>;
  }

  return (
    <DialogTrigger asChild>
      <Button className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md">
        {fallbackText}
      </Button>
    </DialogTrigger>
  );
}

const PricingButton: React.FC<PricingButtonProps> = ({ children, plan }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Geo/IP
  const [zipcode, setZipcode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [regionName, setRegionName] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [ip, setIp] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  // Ensure cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch geo when dialog opens
  useEffect(() => {
    if (!isDialogOpen || zipcode) return;

    const fetchGeo = async () => {
      try {
        const res = await axios.get("/api/ip");
        const data = res.data || {};

        if (!mountedRef.current) return;

        setZipcode(data.zip || "");
        setCity(data.city || "");
        setLatitude(data.latitude || null);
        setLongitude(data.longitude || null);
        setCountryCode(data.country_code || "");
        setRegionName(data.region_name || "");
        setIp(data.ip || "");
      } catch (error) {
        console.error("Geo fetch failed:", error);
        setZipcode("");
      }
    };

    fetchGeo();
  }, [isDialogOpen, zipcode]);

  // Successful signup → redirect
  useEffect(() => {
    if (isDialogOpen && isSignedIn) {
      setIsDialogOpen(false);

      router.replace(window.location.pathname, { scroll: false });
      router.push("/provider/candidates/all");
    }
  }, [isDialogOpen, isSignedIn, router]);

  // If provider already signed in → behave like a link
  const isProvider =
    user?.publicMetadata?.role === "provider" && isSignedIn;

  // metadata (no useMemo — plain object)
  const unsafeMetadata = {
    route: "Regular",
    userIp: ip || undefined,
    zipcode: zipcode || undefined,
    address: `${city || ""}, ${regionName || ""}, ${countryCode || ""}`,
    geocode_address: {
      lng: longitude || undefined,
      lat: latitude || undefined,
    },
    city: city || undefined,
    returning: false,
    role: "provider",
    signup_route: "pricing_page",
    pricing_plan_id: plan,
  };

  return (
    <>
      {/* If already signed in as provider */}
      {isProvider ? (
        <Link href="/provider/candidates/all">{children}</Link>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <SafeTrigger>{children}</SafeTrigger>

          <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-lg">
            <DialogTitle className="text-3xl font-bold text-center">
              Welcome to Kinscare
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm text-center mb-6">
              Sign up or sign in to continue
            </DialogDescription>

            <SignUp
              unsafeMetadata={unsafeMetadata}
              routing="hash"
              forceRedirectUrl="/provider/candidates/all"
              fallbackRedirectUrl="/provider/candidates/all"
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-blue-600 shadow-xl border-none hover:bg-blue-500",
                  card: "border-gray-200 gap-3",
                  rootBox: "flex justify-center w-full px-4",
                  main: "gap-3",
                  cardBox:
                    "w-full max-w-lg bg-white shadow-xl rounded-2xl border border-gray-100",
                },
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PricingButton;
