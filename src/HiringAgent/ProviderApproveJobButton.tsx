"use client";

import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";
import Link from "next/link";
import { useApiClient } from "@/hooks/useApiClient";

const API_BASE =
  "http://https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers";

type Props = {
  jobId: string;
  initialApproved?: boolean;
  initialPaymentLink?: string | null;
  phoneNumber?: string;
};

const ProviderApproveJobButton: React.FC<Props> = ({
  jobId,
  initialApproved = false,
  phoneNumber,
  initialPaymentLink = null,
}) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(initialApproved);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerLink, setProviderLink] = useState(initialPaymentLink);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const role = (user?.publicMetadata?.role as string) || null;
  const isAdmin = role === "admin";
  const { privateApi } = useApiClient();
  // Disable button if already approved
  const disableButton = initialApproved || showCelebration;

  // Resize listener for confetti
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleApprove = async () => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await axios.post(
        `${API_BASE}/jumpstart/${jobId}/provider-approve`,
        { providerUserID: user.id }
      );
      console.log(res.data)
      if (!res.data?.ok) {
        setErrorMessage(res.data?.message || "Approval failed.");
        return;
      }

      const link =
        res.data?.paymentLink ||
        res.data?.data?.paymentLink ||
        res.data?.data?.providerLink ||
        null;
      console.log(link)
      setProviderLink(link);
      //send the SMS
      // --------- Build SMS + send to provider ----------
      try {
        if (phoneNumber) {
          const messageBody =
            `Thanks for approving your job post on KinsCare.\n\n` +
            `To finalize your caregiver match, please secure your payment using this secure link:\n` +
            `${initialPaymentLink}\n\n `;

          const sms_payload = {
            body: messageBody,
            to: phoneNumber,
            country: "US",
          };

          await privateApi.post(`/api/v1/twilio/sms/send`, sms_payload);
        } else {
          console.warn("No phone available to send job preview SMS.");
        }
      } catch (smsErr: any) {
        console.error(
          "Failed to send job preview SMS:",
          smsErr?.message || smsErr
        );
        setSubmitError(
          "Job posted, but we couldn't send the SMS preview. You may need to resend manually."
        );
      }

      setShowCelebration(true);
      router.refresh?.();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * ✅ IMPORTANT FIX:
   * If provider is NOT signed in but job is already approved,
   * still show confetti + payment link.
   */
  if (!isSignedIn) {
    if (!initialApproved) return null;

    return (
      <div className="relative">
        {windowSize.width > 0 && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={250}
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 50,
            }}
          />
        )}

        <div className="mt-2 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="font-semibold text-emerald-900 text-sm">
            Your KinsCare agent has approved this job for you 🎉
          </p>

          <p className="text-xs text-emerald-800">
            You can now complete your Jumpstart payment using the secure link
            below.
          </p>

          {initialPaymentLink ? (
            <Button
              asChild
              className="w-full rounded-lg px-4 py-2 text-sm font-semibold shadow-sm"
            >
              <Link href={initialPaymentLink} target="_blank">
                Add Payment / Verify Payment
              </Link>
            </Button>
          ) : (
            <p className="text-[11px] text-emerald-700">
              Payment link not available here yet. Please check your SMS from
              KinsCare.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Confetti */}
      {showCelebration && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={250}
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
      )}

      {/* Success UI */}
      {showCelebration && (
        <div className="mt-2 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="font-semibold text-emerald-900 text-sm">
            {isAdmin
              ? "Job approved for the provider!"
              : "Job approved – you’re all set!"}
          </p>

          <p className="text-xs text-emerald-800">
            {isAdmin
              ? "The provider can now complete payment using the secure link below."
              : "Please complete your Jumpstart payment using the secure link below."}
          </p>

          {providerLink ? (
            <Button
              asChild
              disabled
              className="w-full rounded-lg px-4 py-2 text-sm font-semibold shadow-sm"
            >
              <Link href={providerLink} target="_blank">
                Providers can Verify payment now
              </Link>
            </Button>
          ) : (
            <p className="text-[11px] text-emerald-700">
              Payment link not available. Check your SMS message from KinsCare.
            </p>
          )}
        </div>
      )}

      {/* Approval button */}
      {!showCelebration && (
        <div className="space-y-2">
          <Button
            onClick={handleApprove}
            disabled={disableButton || isSubmitting}
            className="w-full rounded-xl px-5 py-3 shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)]"
          >
            {disableButton
              ? "Already Approved"
              : isAdmin
              ? "Approve Job for Provider"
              : isSubmitting
              ? "Approving…"
              : "Approve Job"}
          </Button>

          {errorMessage && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderApproveJobButton;
