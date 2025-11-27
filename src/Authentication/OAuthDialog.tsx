"use client";

import React, {
  Children,
  isValidElement,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProviderDialog from "@/Providers/Candidates/ProviderDialog";
import { useAuthContext } from "@/context/AuthContext";
import { SignUp } from "@clerk/nextjs";

const API_BASE = "https://jrp7pe2xhj.us-east-1.awsapprunner.com";

interface OAuthDialogProps {
  message: string; // "caregiver" or other - controls copy + signup_route
  userID?: string; // candidate id
  caregiver: any;
  children: React.ReactNode; // trigger
}

/** Attribution info from URL / localStorage */
type Attribution = {
  cio_id?: string | null;
  email?: string | null;
  name?: string | null;
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
  fallbackText = "View Caregiver",
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

const OAuthDialog: React.FC<OAuthDialogProps> = ({
  message,
  caregiver,
  userID,
  children,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zipcode, setZipcode] = useState<string | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const mountedRef = useRef(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  const authData: any = useAuthContext();
  const { userData } = authData || {};

  // Attribution from URL or localStorage fallback
  const attribution: Attribution = useMemo(() => {
    const urlCio = searchParams.get("cio_id");
    const urlEmail = searchParams.get("email");
    const urlName =
      searchParams.get("name") ??
      searchParams.get("contact_name") ??
      searchParams.get("Contact%20Name");

    const ls = safeLocalGet<any>(LS_KEY_PREFS);

    return {
      cio_id: urlCio ?? ls?.cio_id ?? null,
      email: urlEmail ?? ls?.email ?? null,
      name: urlName ?? ls?.name ?? null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
        const { zip } = data;

        if (mountedRef.current) {
          setZipcode(zip || "");
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

  // If user is already a provider, open ProviderDialog instead of signup
  if (userData && userData.role === "provider") {
    return (
      <ProviderDialog candidate={caregiver}>
        {Children.count(children) ? (
          children
        ) : (
          <Button className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md">
            Message Caregiver
          </Button>
        )}
      </ProviderDialog>
    );
  }

  // Redirect after signup/signin
  const redirectUrl = userID
    ? `/provider/candidates/${userID}`
    : "/provider/candidates/all";

  // What we send to Clerk unsafe metadata
  const unsafeMetadata = {
    role: "provider",
    signup_route: message === "caregiver" ? "caregiver" : "find_caregiver",
    caregiver_id: userID ?? null,
    apply_metadata: true,
    zipcode: zipcode || undefined,
    attribution_cio_id: attribution.cio_id ?? null,
    attribution_email: attribution.email ?? null,
    attribution_name: attribution.name ?? null,
    api_base: API_BASE, // optional if you want server to know which API base
  };

  // Narrative copy per use-case
  const headerTitle =
    message === "caregiver" ? "Welcome to Kinscare" : "Continue with Kinscare";
  const headerSubtitle =
    message === "caregiver"
      ? "Sign in to Kinscare to connect with this caregiver."
      : "Create your provider account to view candidates and hire faster.";

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SafeTrigger>{children}</SafeTrigger>
      <DialogContent
        className="
      p-6
      max-w-md 
      overflow-hidden 
      rounded-2xl 
      border border-gray-100 
      shadow-2xl
      gap-0
      bg-white
    "
      >
        {/* Header Section */}
        <div className="px-1 py-4 text-center bg-white">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
            {headerTitle}
          </h3>
          <p className=" text-gray-600">{headerSubtitle}</p>
        </div>

        {/* Clerk Signup */}
        <SignUp
          unsafeMetadata={unsafeMetadata}
          afterSignUpUrl={redirectUrl}
          afterSignInUrl={redirectUrl}
          redirectUrl={redirectUrl}
          appearance={{
            elements: {
              // Remove ALL margins/padding so Clerk fits the Dialog
              rootBox: "m-0 p-0 w-full",
              cardBox: "w-full shadow-none border-none rounded-none bg-white",
              card: "m-0 p-0 w-full shadow-none border-none ",
              main: "m-0 p-0 w-full border-none shadow-none flex flex-col gap-0",
              header: "hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              // Form content full-width with no side padding
              form: "m-0 p-2 w-full flex flex-col gap-4",
              formFieldInput: "h-[3.5rem]",
              formFieldLabel: "text-sm",
              // Social buttons full bleed
              socialButtons: "m-0 p-2 pb-4 pt-2 w-full flex  gap-2",
              socialButtonsBlockButton:"h-10",
              socialButtonsProviderIcon:"w-10",
              // Primary button full width
              formButtonPrimary:
                "bg-blue-600 shadow-xl  py-2 border-none hover:bg-blue-500",
              // Footer full-width and flush
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
};

export default OAuthDialog;
