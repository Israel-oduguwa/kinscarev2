import React, { useContext, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { Loader2 } from "lucide-react";
import MongoContext from "@/app/MongoContext";
import { useRouter } from "next/navigation";
import { fetchContactsData, fetchUserData } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface FrequentPaymentFormProps {
  clientSecret: string; // The client secret for SetupIntent
  customerId: string; // Stripe Customer ID
  priceId: string; // Stripe Price ID for the subscription
  userID: string; // Internal user ID (to update the database)
  onSuccess: (result: any) => void; // Callback for successful setup and subscription
  intentType: string;
  subscriptionID: string;
  close: any;
  plan: any;
  subscription: any;
  onError?: (error: any) => void; // Optional callback for handling errors
}

const FrequentPaymentForm: React.FC<FrequentPaymentFormProps> = ({
  clientSecret,
  customerId,
  subscriptionID,
  subscription,
  intentType,
  close,
  priceId,
  plan,
  userID,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { user, setUserData, setUser }: any = useContext(MongoContext);
  const router = useRouter();
  console.log(subscription);

  //   // Function to update PaymentMethod ID in the database
  const updatePaymentMethod = async (subscription: any) => {
    try {
      // Calculate the free trial end date (7 days from now)
      const freeTrialEndDate = new Date();
      freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);

      // Payload to update the database
      const updatePayload = {
        collectionName: "contacts", // Adjust collection name as needed
        operation: "updateOne", // Specify operation type
        filter: { userID, role: "provider" }, // Customize filter
        update: {
          $set: {
            subscription_id: subscriptionID, // Save subscription ID
            subscribed: true, // Mark user as subscribed
            trial: "expired", // Mark trial as expired
            subscription_start_date: new Date(
              subscription.current_period_start * 1000
            ).toISOString(), // Start date in ISO format
            subscription_end_date: new Date(
              subscription.current_period_end * 1000
            ).toISOString(), // Start date in ISO format
            subscription_status: "complete", // Subscription status
            plan: plan,
            plan_id: subscription.plan.id, // Save the plan ID
            payment_verified: true, // Optionally set payment verified
          },
        },
      };

      // Send the request to the CRUD operation endpoint
      const response = await axios.post(
        "http://localhost:8081/api/v1/auth/crud-operation",
        updatePayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      await user.refreshCustomData();
      router.refresh();
      // Handle success or error response
      if (response.data.success) {
        console.log("PaymentMethod ID updated successfully:", response.data);
      } else {
        throw new Error(
          response.data.message || "Failed to update PaymentMethod ID."
        );
      }
    } catch (error: any) {
      console.log(error);
      console.error("Error updating PaymentMethod ID:", error.message);
      throw new Error(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setMessage("Stripe has not loaded. Please try again.");
      return;
    }
    setIsLoading(true);
    try {
      // Confirm the setup intent to save the card
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });
      console.log(result);
      if (result.error) {
        // Handle errors from Stripe
        // setMessage(result.error.message);
        toast({
          title: "Error",
          description: result.error.message || "An unknown error occurred.",
          variant: "destructive",
        });
        console.log(result.error);
        if (onError) onError(result.error);
        setIsLoading(false);
        return;
      }
      // Extract the PaymentMethod ID
      const paymentMethodID: any = result.paymentIntent?.payment_method;
      //   console.log(paymentMethodID);
      if (!paymentMethodID) {
        throw new Error("PaymentMethod ID is missing.");
      }
      // Update the database with the PaymentMethod ID
      await updatePaymentMethod(subscription);
      // Create the subscription with the backend API
      // const subscription = await createSubscription();
      // Success! Notify parent component
      onSuccess({ paymentMethodID });
      //   setMessage("free trial started!");
      // we would fetch the userData and update the context
      const fetchedData: any = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      // console.log(fetchedData);
      if (fetchedData) {
        console.log(fetchedData)
        // await setUser(fetchedData.result);
        user.refreshCustomData();
        // router.refresh();
        setIsLoading(false);
        close();
      }
    } catch (error: any) {
      setMessage(error.message);
      if (onError) onError(error);
      setIsLoading(false);
    }
  };

  const paymentElementOptions: any = {
    layout: "tabs", // "tabs" or "accordion"
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <div className="flex justify-end">
        <Button disabled={isLoading || !stripe || !elements} id="submit">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Submit
        </Button>
      </div>
      {/* Show error or success messages */}
      {/* {message && (
        <div id="payment-message" className="text-red-500">
          {message}
        </div>
      )} */}
    </form>
  );
};

export default FrequentPaymentForm;
