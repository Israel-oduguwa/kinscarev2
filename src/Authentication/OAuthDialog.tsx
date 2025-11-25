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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com";

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
  fallbackText = "Continue",
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
    apply_metadata:true,
    zipcode: zipcode || undefined,
    attribution_cio_id: attribution.cio_id ?? null,
    attribution_email: attribution.email ?? null,
    attribution_name: attribution.name ?? null,
    api_base: API_BASE, // optional if you want server to know which API base
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SafeTrigger>{children}</SafeTrigger>
      <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-md">
        <div className="mt-2">
          <SignUp
            // All the important context for your backend:
            unsafeMetadata={unsafeMetadata}
            // Redirects after successful signup/signin
            afterSignUpUrl={redirectUrl}
            afterSignInUrl={redirectUrl}
            redirectUrl={redirectUrl}
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
      </DialogContent>
    </Dialog>
  );
};

export default OAuthDialog;
