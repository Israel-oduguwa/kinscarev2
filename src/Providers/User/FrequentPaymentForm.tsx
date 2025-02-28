import React, { useContext, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import MongoContext from "@/app/MongoContext";
import { fetchContactsData, trackEvents } from "@/lib/utils";
import TagManager from "react-gtm-module";

interface FrequentPaymentFormProps {
  clientSecret: string;
  customerId: string;
  priceId: string;
  userID: string;
  onSuccess: (result: any) => void;
  intentType: string;
  subscriptionID: string;
  close: () => void;
  plan: any;
  subscription: any;
  onError?: (error: any) => void;
}

const FrequentPaymentForm: React.FC<FrequentPaymentFormProps> = ({
  clientSecret,
  subscriptionID,
  subscription,
  intentType,
  close,
  plan,
  userID,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user, setCustomData, userData }: any = useContext(MongoContext);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updatePaymentMethod = async () => {
    try {
      const freeTrialEndDate = new Date();
      freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);

      const payload = {
        collectionName: "contacts",
        operation: "updateOne",
        filter: { userID, role: "provider" },
        update: {
          $set: {
            subscription_id: subscriptionID,
            subscribed: true,
            trial: "expired",
            subscription_start_date: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            subscription_end_date: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            subscription_status: "complete",
            plan,
            plan_id: subscription.plan.id,
            payment_verified: true,
          },
        },
      };

      const response = await axios.post(
        "https://api.kinscare.org/api/v1/auth/crud-operation",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update payment data.");
      }

      await user.refreshCustomData();
      router.refresh();
    } catch (error: any) {
      console.error("Error updating payment method:", error.message);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!stripe || !elements) {
      setMessage("Stripe is not loaded. Please try again.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Confirm the payment
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });
  
      // Handle errors in payment confirmation
      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "An unknown error occurred.",
          variant: "destructive",
        });
        if (onError) onError(result.error);
        setIsLoading(false);
        return;
      }
  
      // Get the Payment Method ID
      const paymentMethodID = result.paymentIntent?.payment_method;
      if (!paymentMethodID) throw new Error("Payment method ID is missing.");
  
      // Update the payment method
      await updatePaymentMethod();
     
      // Event payload for tracking
      const eventPayload = {
        // subscription_id: subscriptionID,
        settings: userData?.settings,
        lname: userData?.lname,
        subscription_status: "complete",
        plan,
        subscription_start_date: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        fname: userData?.fname,
        tel: userData?.auth?.tel,
        // plan_id: subscription.plan.id,
        zipcode: userData?.zipcode,
        city: userData?.city,
        // payment_verified: true,
        email: userData?.auth?.email,
      };

      const tagManagerArgs = {
        dataLayer: {
          ...eventPayload,
          event: `purchase_plan`,
         
        },
      };
       TagManager.dataLayer(tagManagerArgs);
  
      // Track purchase event
      trackEvents(user?.customData?.hash, "Purchase Plan", eventPayload);
  
      // Call onSuccess callback with payment method ID
      onSuccess({ paymentMethodID });
  
      // Fetch updated data after payment
      const updatedData = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      if (updatedData) {
        await setCustomData(updatedData.result);
  
        // Wait for webhook processing (e.g., 2 seconds)
        setTimeout(() => {
          window.location.reload(); // Reload after the delay
          close();
          setIsLoading(false); // Ensure loading state is turned off
        }, 3000); // 3-second delay
      }
    } catch (error: any) {
      // Handle errors and show a toast notification
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
      if (onError) onError(error);
    } finally {
      
    }
  };
  
  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <div className="flex justify-end">
        <Button disabled={isLoading || !stripe || !elements} id="submit">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </div>
      {message && <p className="text-red-500">{message}</p>}
    </form>
  );
};

export default FrequentPaymentForm;
