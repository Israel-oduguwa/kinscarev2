import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { fetchContactsData, trackEvents } from "@/lib/utils";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import TagManager from "react-gtm-module";
import { toast } from "sonner";

interface JumpStartPaymentProps {
  onSuccess: (result: any) => void;
  subscriptionID: string;
  close: () => void;
  plan: any;
  subscription: any;
  onError?: (error: any) => void;
}

const JumpStartPayment: React.FC<JumpStartPaymentProps> = ({
  subscriptionID,
  subscription,
  close,
  plan,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user, setCustomData, userData }: any = useAuthContext();
  const userID = userData?.userID || user?.customData?.userID;
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { privateApi } = useApiClient();
  // -------- utils ----------
  const getErrMsg = (e: any, fallback = "Something went wrong.") => {
    if (!e) return fallback;
    if (typeof e === "string") return e;
    return e?.response?.data?.message || e?.message || fallback;
  };

  const notifyError = (e: any, ctx?: string) => {
    const base = getErrMsg(e);
    toast.error(ctx ? `${ctx}: ${base}` : base);
  };

  const requireStripeReady = () => {
    if (!stripe || !elements) {
      const m = "Stripe is not loaded. Please refresh and try again.";
      setMessage(m);
      toast.error(m);
      return false;
    }
    return true;
  };

  // -------- data updates ----------
  const updatePaymentMethod = async () => {
    const start = subscription?.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    const end = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();

    const planId = subscription?.plan?.id ?? null;

    const payload = {
      collectionName: "contacts",
      operation: "updateOne",
      filter: { userID, role: "provider" },
      update: {
        $set: {
          subscription_id: subscriptionID,
          subscribed: true,
          trial: "expired",
          subscription_start_date: start,
          subscription_end_date: end,
          subscription_status: "complete",
          plan,
          plan_id: planId,
          payment_verified: true,
        },
      },
    };

    const res = await privateApi.post(
      "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/crud-operation",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Failed to update payment data.");
    }
  };

  const updateJumpstartPayment = async () => {
    const start = subscription?.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    const end = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();

    const planId = subscription?.plan?.id ?? null;

    const payload = {
      collectionName: "jumpstart_hiring",
      operation: "updateOne",
      filter: { "user.userID": userID },
      update: {
        $set: {
          status: "active",
          "payment.status": "complete",
          "payment.subscription_id": subscriptionID,
          "payment.verified": true,
          "payment.plan": plan,
          "payment.plan_id": planId,
          "payment.subscription_start_date": start,
          "payment.subscription_end_date": end,
          "payment.subscription_status": "complete",
          "payment.payment_verified": true,
          updatedAt: new Date().toISOString(),
        },
        $push: {
          auditTrail: {
            event: "payment_completed",
            by: "user",
            timestamp: new Date(),
          },
        },
      },
    };

    const res = await privateApi.post(
      "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/crud-operation",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!res?.data?.success) {
      throw new Error(
        res?.data?.message || "Failed to sync Jumpstart payment."
      );
    }
  };

  const sendConfirmationEmail = async ({
    email,
    first_name,
  }: {
    email: string;
    first_name: string;
  }) => {
    try {
      await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/email/jumpstart/payment-confirmation",
        { email, first_name }
      );
    } catch (e) {
      // non-blocking
      console.warn("Email send failed:", getErrMsg(e));
    }
  };

  // -------- submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard rails
    if (!userID) {
      toast.error("Missing user session. Please sign in and try again.");
      return;
    }
    if (!requireStripeReady()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Confirm the payment
      const result = await stripe!.confirmPayment({
        elements: elements!,
        confirmParams: {}, // using default return_url-less, with redirect: "if_required"
        redirect: "if_required",
      });

      // Handle Stripe error object
      if (result.error) {
        if (onError) onError(result.error);
        notifyError(result.error, "Payment failed");
        setIsLoading(false);
        return;
      }

      // Ensure we have a PaymentIntent and acceptable status
      const pi = result.paymentIntent;
      const status = pi?.status;

      if (!pi || !status) {
        throw new Error("No payment confirmation received from Stripe.");
      }

      // Acceptable statuses for proceeding:
      // - succeeded (paid)
      // - processing (bank debit etc.); proceed but inform user
      // - requires_capture (if using manual capture; unlikely here)
      if (!["succeeded", "processing", "requires_capture"].includes(status)) {
        // Common failure statuses:
        // requires_payment_method, requires_confirmation, requires_action
        throw new Error(
          `Payment not completed (status: ${status}). Please try another payment method.`
        );
      }

      const paymentMethodID = pi.payment_method;
      if (!paymentMethodID) {
        throw new Error("Payment method ID was not returned by Stripe.");
      }

      // Persist updates
      await updatePaymentMethod();
      await updateJumpstartPayment();

      // Tag Manager + Mixpanel tracking (best-effort)
      try {
        const eventPayload = {
          settings: userData?.settings,
          lname: userData?.lname,
          subscription_status: "complete",
          plan,
          subscription_start_date: subscription?.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : undefined,
          fname: userData?.fname,
          tel: userData?.auth?.tel,
          zipcode: userData?.zipcode,
          city: userData?.city,
          email: userData?.auth?.email,
        };
        TagManager.dataLayer({
          dataLayer: { ...eventPayload, event: "payment_jumpstart" },
        });
        trackEvents(user?.customData?.hash, "Purchase Plan", eventPayload);
      } catch (e) {
        console.warn("Tracking failed:", getErrMsg(e));
      }

      // Fire success callback early (UI responsiveness)
      onSuccess({ paymentMethodID });

      // Confirmation email (non-blocking)
      if (userData?.auth?.email) {
        await sendConfirmationEmail({
          email: userData.auth.email,
          first_name: `${userData?.fname ?? ""} ${
            userData?.lname ?? ""
          }`.trim(),
        });
      }

      // Refresh contact data (best-effort)
      try {
        const updatedData = await fetchContactsData(
          user?.customData?.userID,
          user?.customData?.email
        );
        if (updatedData?.result && typeof setCustomData === "function") {
          await setCustomData(updatedData.result);
        }
      } catch (e) {
        console.warn("Post-payment refresh failed:", getErrMsg(e));
      }

      toast.success("Payment successful. Welcome to Jumpstart!");
      // Route then close
      router.push("/provider/jumpstart");
      close();
    } catch (e: any) {
      notifyError(e, "Payment Failed");
      if (onError) onError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <div className="flex justify-end">
        <Button
          className="bg-indigo-600 text-white px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
          disabled={isLoading || !stripe || !elements}
          id="submit"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay $175 to Jumpstart Hire
        </Button>
      </div>
      {message && <p className="text-red-500">{message}</p>}
    </form>
  );
};

export default JumpStartPayment;
