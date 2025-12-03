"use client";

import React, {
  Children,
  isValidElement,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { SignUp, useUser } from "@clerk/nextjs";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:8081";

type Attribution = {
  email?: string | null;
  fn?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

const LS_KEY_PREFS = "kc_search_prefs";

const safeLocalGet = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

/** Safe trigger wrapper to avoid crashes if children is weird */
function SafeTrigger({
  children,
  fallbackText = "Get Started",
}: {
  children: React.ReactNode;
  fallbackText?: string;
}) {
  let triggerChild: React.ReactElement;

  if (Children.count(children) === 1 && isValidElement(children)) {
    triggerChild = children as React.ReactElement;
  } else if (typeof children === "string") {
    triggerChild = <Button>{children}</Button>;
  } else {
    triggerChild = (
      <Button className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md">
        {fallbackText}
      </Button>
    );
  }

  return <DialogTrigger asChild>{triggerChild}</DialogTrigger>;
}

function GetStartedBtn({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zipcode, setZipcode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [region_name, setRegionName] = useState<string | null>(null);
  const [country_code, setCountryCode] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [ip, setIp] = useState<string | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const mountedRef = useRef(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  // Read URL params for /explore?email=...&fn=...&utm_*
  const attribution: Attribution = useMemo(() => {
    return {
      email: searchParams.get("email"),
      fn: searchParams.get("fn"),
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
    };
  }, [searchParams]);

  // Attribution from URL or localStorage fallback, merged
  const mergedAttribution = useMemo(() => {
    const ls = safeLocalGet<any>(LS_KEY_PREFS) ?? {};
    return {
      email: attribution.email ?? ls?.email ?? null,
      fn: attribution.fn ?? ls?.name ?? null,
      utm_source: attribution.utm_source ?? ls?.utm_source ?? null,
      utm_medium: attribution.utm_medium ?? ls?.utm_medium ?? null,
      utm_campaign: attribution.utm_campaign ?? ls?.utm_campaign ?? null,
      landing_path: ls?.path ?? (typeof window !== "undefined" ? window.location.pathname : null),
      landing_href: ls?.href ?? (typeof window !== "undefined" ? window.location.href : null),
    };
  }, [attribution]);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch IP/zipcode when the dialog opens (once)
  React.useEffect(() => {
    if (!isDialogOpen || zipcode) return;

    const fetchGeo = async () => {
      try {
        if (!mountedRef.current) return;
        setIsGeoLoading(true);

        const res = await axios.get("/api/ip");
        const data = res?.data || {};
        const { zip, city, latitude, longitude, country_code, region_name, ip } = data;

        if (mountedRef.current) {
          setZipcode(zip || "");
          setCity(city || "");
          setLatitude(latitude || null);
          setLongitude(longitude || null);
          setCountryCode(country_code || "");
          setRegionName(region_name || "");
          setIp(ip || "");
        }
      } catch (err) {
        console.error("Failed to retrieve IP data:", err);
        if (mountedRef.current) {
          setZipcode("");
        }
      } finally {
        if (mountedRef.current) {
          setIsGeoLoading(false);
        }
      }
    };

    fetchGeo();
  }, [isDialogOpen, zipcode]);

  // Detect successful signup/signin and redirect
  useEffect(() => {
    if (isDialogOpen && isSignedIn) {
      setIsDialogOpen(false);
      // Clean any stray query params (just in case)
      const cleanUrl = window.location.pathname;
      router.replace(cleanUrl, { scroll: false });
      router.push("/vitae/career-plan");
    }
  }, [isDialogOpen, isSignedIn, router]);

  // If user is already a caregiver, render as link (no auto-redirect)
  if (isSignedIn && user?.publicMetadata.role === "caregiver") {
    return <Link href="/vitae/career-plan">{children}</Link>;
  }

  // What we send to Clerk unsafe metadata
  const unsafeMetadata = {
    role: "caregiver",
    signup_route: "explorer",
    apply_metadata: true,
    zipcode: zipcode || undefined,
    city: city || undefined,
    geocode_address: { lng: longitude || undefined, lat: latitude || undefined },
    address: `${city || ""}, ${region_name || ""}, ${country_code || ""}`.trim(),
    userIp: ip || undefined,
    acquisition_channel: mergedAttribution.utm_source || "email",
    utm_source: mergedAttribution.utm_source ?? null,
    utm_medium: mergedAttribution.utm_medium ?? null,
    utm_campaign: mergedAttribution.utm_campaign ?? null,
    landing_path: mergedAttribution.landing_path ?? null,
    landing_href: mergedAttribution.landing_href ?? null,
    attribution_email: mergedAttribution.email ?? null,
    attribution_name: mergedAttribution.fn ?? null,
    api_base: API_BASE,
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SafeTrigger>{children}</SafeTrigger>
      <DialogContent className="p-0 max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-2xl">
        <div className="px-5 pt-5 pb-3 bg-white border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Start your career plan</h3>
          <p className="text-sm text-gray-600">
            Create your account to unlock personalized recommendations.
          </p>
        </div>
        <SignUp
          unsafeMetadata={unsafeMetadata}
          routing="virtual"
          forceRedirectUrl={"/vitae/career-plan"}
          fallbackRedirectUrl={"/vitae/career-plan"}
          afterSignUpUrl={"/vitae/career-plan"}
          afterSignInUrl={"/vitae/career-plan"}
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
  );
}

export default GetStartedBtn;
