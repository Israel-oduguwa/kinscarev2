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

          <DialogContent className="p-0 max-w-md max-h-[90vh] overflow-x-auto overflow-y-auto rounded-2xl border border-gray-100 shadow-2xl">
            <div className="px-5 pt-5 pb-3 bg-white border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                Sign up to view pricing
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Create your provider account to unlock candidate access.
              </p>
            </div>

            <SignUp
              unsafeMetadata={unsafeMetadata}
              routing="hash"
              forceRedirectUrl="/provider/candidates/all"
              fallbackRedirectUrl="/provider/candidates/all"
              appearance={{
                elements: {
                  rootBox: "m-0 p-0 w-full",
                  cardBox: "w-full shadow-none border-none rounded-none bg-white",
                  card: "m-0 p-0 w-full shadow-none border-none",
                  main: "m-0 p-0 w-full border-none shadow-none flex flex-col gap-0",
                  header: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  form: "m-0 p-2 w-full flex flex-col gap-4",
                  formFieldInput: "h-[3.5rem]",
                  formFieldLabel: "text-sm",
                  socialButtons: "m-0 p-2 pb-4 pt-2 w-full flex gap-2",
                  socialButtonsBlockButton: "h-10",
                  socialButtonsProviderIcon: "w-10",
                  formButtonPrimary:
                    "bg-blue-600 shadow-xl py-2 border-none hover:bg-blue-500",
                  footer: "m-0 p-2 w-full",
                  footerAction: "text-sm text-gray-600",
                  footerActionLink: "text-blue-600 font-semibold hover:underline",
                },
                layout: {
                  socialButtonsVariant: "blockButton",
                  socialButtonsPlacement: "top",
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
