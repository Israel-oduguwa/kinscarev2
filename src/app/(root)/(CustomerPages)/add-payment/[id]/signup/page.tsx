"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import axios from "axios";

export default function AddPaymentSignupPage() {
  const params = useParams();
  const flowId = typeof params?.id === "string" ? params.id : "";
  const [zipcode, setZipcode] = useState<string | null>(null);
  const [loadingZip, setLoadingZip] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchGeo = async () => {
      try {
        setLoadingZip(true);
        const response = await axios.get("/api/ip");
        const { zip } = response.data || {};
        if (!cancelled) {
          setZipcode(zip || "");
        }
      } catch (error) {
        if (!cancelled) {
          setZipcode("");
        }
      } finally {
        if (!cancelled) {
          setLoadingZip(false);
        }
      }
    };

    fetchGeo();
    return () => {
      cancelled = true;
    };
  }, []);

  const unsafeMetadata = useMemo(
    () => ({
      role: "provider",
      source: "add-payment",
      signup_route: "add_payment",
      flowId: flowId || undefined,
      zipcode: zipcode || undefined,
    }),
    [flowId, zipcode]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#e0f2fe,#f8fafc_55%)] px-4 py-12">
      <div className="w-full max-w-5xl rounded-[28px] border border-slate-200/60 bg-white shadow-xl overflow-hidden">
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="p-8 md:p-10 bg-slate-900 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Provider Access
            </p>
            <h1 className="mt-3 text-2xl md:text-3xl font-semibold leading-tight">
              Finish your KinsCare signup to access your caregiver matches
            </h1>
            <p className="mt-3 text-sm text-slate-200">
              We’ll connect your new account to the payment you just secured and
              keep you updated as we source caregivers.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-100/90">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Post and approve jobs in minutes
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Track caregiver matches in one dashboard
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Get notifications on new applicants
              </div>
            </div>
            {loadingZip && (
              <p className="mt-6 text-xs text-slate-300">
                Detecting your location…
              </p>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-5 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Create your provider account
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Use the same email you used for payment if possible.
              </p>
            </div>

            <SignUp
              unsafeMetadata={unsafeMetadata}
              forceRedirectUrl="/provider/candidates/all"
              appearance={{
                elements: {
                  rootBox: "m-0 p-0 w-full",
                  cardBox:
                    "w-full shadow-none border-none rounded-none bg-white",
                  card: "m-0 p-0 w-full shadow-none border-none",
                  main:
                    "m-0 p-0 w-full border-none shadow-none flex flex-col gap-0",
                  header: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  form: "m-0 p-2 w-full flex flex-col gap-4",
                  formFieldInput: "h-12",
                  formFieldLabel: "text-sm",
                  socialButtons:
                    "m-0 p-2 pb-4 pt-2 w-full flex flex-col gap-2",
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
          </div>
        </div>
      </div>
    </div>
  );
}
