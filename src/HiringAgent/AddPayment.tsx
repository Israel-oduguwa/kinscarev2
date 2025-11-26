"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, usePathname } from "next/navigation";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Confetti from "react-confetti";

const stripe_key:any = process.env.STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripe_key);

const API_BASE = "http://localhost:8081/api/v1/providers";

type Applicant = {
  _id: string;
  email: string;
  phone?: string;
  zipcode?: string;
  existingAccount?: boolean;
  userID?: string;
  temp_hash?: string;
  channel?: string;
  tags?: string[];
  jump_start?: boolean;
};

type ApplicantResponse = {
  ok: boolean;
  data?: Applicant;
  message?: string;
};

type VerifyPaymentResponse = {
  ok: boolean;
  data?: {
    clientSecret: string;
  };
  message?: string;
};

type ConfirmResponse = {
  ok: boolean;
  data?: any;
  message?: string;
};

function PaymentForm({
  clientSecret,
  twilioId,
  onSuccess,
}: {
  clientSecret: string;
  twilioId: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isElementReady, setIsElementReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Make sure the PaymentElement is actually mounted
    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      setErrorMessage(
        "Your secure payment form is still loading. Please wait a moment and try again."
      );
      setIsSubmitting(false);
      return;
    }

    // 1) Confirm card with Stripe (no redirect)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(
        error.message || "Something went wrong while confirming payment."
      );
      setIsSubmitting(false);
      return;
    }

    if (!paymentIntent) {
      setErrorMessage("Payment could not be confirmed.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 2) Tell backend to confirm + update DB
      const res = await axios.post<ConfirmResponse>(
        `${API_BASE}/jumpstart/twilio-signup/${twilioId}/confirm-card`,
        {
          paymentIntentId: paymentIntent.id,
        }
      );

      if (!res.data.ok) {
        setErrorMessage(
          res.data.message ||
            "Payment was authorized, but we could not update your record. Please contact support."
        );
      } else {
        // ✅ Everything succeeded → show thank you UI
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "Payment was authorized, but we could not update your record. Please contact support."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <PaymentElement
          onReady={() => {
            setIsElementReady(true);
          }}
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !isElementReady || isSubmitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Processing..." : "Authorize payment"}
      </button>

      <p className="text-[11px] text-gray-500 text-center">
        We place a temporary authorization on your card. You’re only charged
        after we successfully match you with a caregiver.
      </p>
    </form>
  );
}

function ThankYouScreen({ email }: { email: string }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 overflow-hidden">
      {windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={350}
        />
      )}

      <div className="relative max-w-md w-full rounded-2xl border border-emerald-100 bg-white px-6 py-8 shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 mb-4">
          <span className="text-2xl">✅</span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 text-center">
          Thank you! Your payment is secured.
        </h1>

        <p className="mt-2 text-sm text-gray-600 text-center">
          We&apos;ve placed a temporary authorization on your card and linked it
          to your caregiver request.
        </p>

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Contact email</p>
          <p className="text-sm text-gray-900 break-all">{email}</p>
        </div>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Our team will start matching you with a caregiver based on your needs.
          You&apos;ll receive updates at this email address.
        </p>

        <p className="mt-3 text-[11px] text-gray-500 text-center">
          If you have any questions, reply directly to your KinsCare emails or
          contact our support team.
        </p>
      </div>
    </div>
  );
}

function AddPayment() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Try to get id from `/.../:id` or from `?id=...`
  const paramId = typeof params?.id === "string" ? params.id : undefined;
  const queryId = searchParams.get("id") || searchParams.get("twilioId");
  const pathId = pathname ? pathname.split("/").filter(Boolean).pop() : null;
  const twilioId = paramId || queryId || pathId || "";

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loadingApplicant, setLoadingApplicant] = useState(true);
  const [applicantError, setApplicantError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const fetchApplicant = async () => {
      if (!twilioId) {
        setApplicantError(
          "Invalid link. Please use the payment link you received via SMS."
        );
        setLoadingApplicant(false);
        return;
      }

      try {
        const res = await axios.get<ApplicantResponse>(
          `${API_BASE}/jumpstart/applicant/${twilioId}`
        );

        if (!res.data.ok || !res.data.data) {
          setApplicantError(
            res.data.message ||
              "We could not find your request. Please contact support."
          );
        } else {
          setApplicant(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setApplicantError(
          "Unable to load your details. Please refresh or try again later."
        );
      } finally {
        setLoadingApplicant(false);
      }
    };

    fetchApplicant();
  }, [twilioId]);

  console.log(applicant?.existingAccount, applicant?.userID, twilioId);

  const handleCreatePaymentIntent = async () => {
    if (!applicant) return;
    setCreatingIntent(true);
    setIntentError(null);

    try {
      // Build payload based on existing account vs new
      const isExisting =
        applicant.existingAccount === true && !!applicant.userID;

      const payload: any = {
        twilio_signup_id: twilioId,
        existingAccount: isExisting,
      };

      if (isExisting) {
        payload.userID = applicant.userID;
      } else {
        payload.temp_hash = applicant.temp_hash;
        payload.email = applicant.email;
        payload.phone = applicant.phone;
        payload.zipcode = applicant.zipcode;
      }

      const res = await axios.post<VerifyPaymentResponse>(
        `${API_BASE}/jumpstart/verify_payment`,
        payload
      );
      console.log(res.data);
      if (!res.data.ok || !res.data.data?.clientSecret) {
        setIntentError(
          res.data.message ||
            "Unable to start secure payment. Please try again."
        );
      } else {
        setClientSecret(res.data.data.clientSecret);
      }
    } catch (err) {
      console.error(err);
      setIntentError(
        "Failed to connect to the payment server. Please try again."
      );
    } finally {
      setCreatingIntent(false);
    }
  };

  if (loadingApplicant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm max-w-md w-full">
          <div className="h-4 w-32 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="h-3 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-3 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (applicantError || !applicant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-xl w-full rounded-2xl border border-red-100 bg-red-50 px-6 py-5 shadow-sm">
          <h1 className="text-lg font-semibold text-red-700">
            There was a problem
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {applicantError ||
              "We could not load your payment link. Please contact support."}
          </p>
        </div>
      </div>
    );
  }

  // ✅ If payment is completed, show the Thank You UI
  if (paymentCompleted) {
    return <ThankYouScreen email={applicant.email} />;
  }

  const isExisting = applicant.existingAccount === true && !!applicant.userID;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="max-w-xl w-full rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-md">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Secure your caregiver match
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            We’ll place a temporary authorization on your card. You’re only
            charged once we’ve successfully matched you with a caregiver.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 px-4 md:py-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900 break-all">
                {applicant.email}
              </p>
            </div>
            {applicant.zipcode && (
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500">ZIP Code</p>
                <p className="text-sm text-gray-900">{applicant.zipcode}</p>
              </div>
            )}
          </div>

          {applicant.phone && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500">Phone</p>
              <p className="text-sm text-gray-900">{applicant.phone}</p>
            </div>
          )}

          <div className="mt-3">
            {isExisting ? (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1 inline-block">
                We’ve found your existing KinsCare account. This payment will be
                linked to your profile and free trial.
              </p>
            ) : (
              <p className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-1 inline-block">
                We’ll create a secure profile with this information when you
                complete payment.
              </p>
            )}
          </div>
        </div>

        {!clientSecret && (
          <>
            {intentError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {intentError}
              </p>
            )}

            <button
              type="button"
              onClick={handleCreatePaymentIntent}
              disabled={creatingIntent}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creatingIntent
                ? "Preparing secure payment..."
                : "Continue to secure payment"}
            </button>

            <p className="mt-3 text-[11px] text-gray-500 text-center">
              You’ll be taken to a secure card form powered by Stripe. No charge
              is made until your match is confirmed.
            </p>
          </>
        )}

        {clientSecret && (
          <div className="mt-2">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                twilioId={twilioId}
                onSuccess={() => setPaymentCompleted(true)}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddPayment;
