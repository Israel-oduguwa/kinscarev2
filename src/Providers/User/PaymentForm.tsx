import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { rewardReferrer } from "@/lib/paymentUtils";
import { fetchUserData, trackEvents } from "@/lib/utils";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import axios, { AxiosResponse } from "axios";
import { first } from "lodash";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import TagManager from "react-gtm-module";

interface PaymentFormProps {
  clientSecret: string; // The client secret for SetupIntent
  customerId: string; // Stripe Customer ID
  priceId: string; // Stripe Price ID for the subscription
  userID: string; // Internal user ID (to update the database)
  onSuccess: (result: any) => void; // Callback for successful setup and subscription
  intentType: string;
  setIsTrialExpired: any;
  close: any;
  onError?: (error: any) => void; // Optional callback for handling errors
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  setIsTrialExpired,
  customerId,
  intentType,
  close,
  priceId,
  userID,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { user, setUserData, userData }: any = useContext(MongoContext);
  const router = useRouter();

  // Function to update PaymentMethod ID in the database
  const updatePaymentMethod = async (paymentMethodID: string) => {
    try {
      // Calculate the free trial end date (7 days from now)
      const freeTrialEndDate = new Date();
      freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);

      // Payload to update the database
      const payload = {
        collectionName: "contacts", // Specify the collection to update
        operation: "updateOne", // Specify the operation type
        filter: { userID, role: "provider" }, // Filter by userID and role
        update: {
          $set: {
            payment_method_id: paymentMethodID, // Update the PaymentMethod ID
            verified: true,
            trial: true, // Mark free trial as active
            subscribed: false, // Mark subscription as inactive
            trial_start_date: new Date().toISOString(), // Set free trial start date
            trial_end_date: freeTrialEndDate.toISOString(), // Set free trial end date
            payment_verified: true, // Optionally set verified to true if required
          },
        },
      };

      // Send the request to the CRUD operation endpoint
      const response = await axios.post(
        "https://kinscare-backend.onrender.com/api/v1/auth/crud-operation",
        payload,
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
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });

      if (result.error) {
        // Handle errors from Stripe
        // setMessage(result.error.message);
        toast({
          title: "Error",
          description: result.error.message || "An unknown error occurred.",
          variant: "destructive",
        });
        // console.log(result.error);
        if (onError) onError(result.error);
        setIsLoading(false);
        return;
      }

      // Extract the PaymentMethod ID
      const paymentMethodID: any = result.setupIntent?.payment_method;
      // console.log(paymentMethodID);
      if (!paymentMethodID) {
        throw new Error("PaymentMethod ID is missing.");
      }

      const tagManagerArgs = {
        dataLayer: {
          event: `add_payment_method`,
          step: "verify_identity",
          settings: userData?.settings,
          lname: userData?.lname,
          fname: userData?.fname,
          tel: userData?.auth?.tel,
          zipcode: userData?.zipcode,
          city: userData?.city,
          email: userData?.auth?.email,
        },
      };
      TagManager.dataLayer(tagManagerArgs);
      // Update the database with the PaymentMethod ID
      await updatePaymentMethod(paymentMethodID);
      const payloadAddPayment = {
        settings: userData?.settings,
        lname: userData?.lname,
        fname: userData?.fname,
        tel: userData?.auth?.tel,
        zipcode: userData?.zipcode,
        city: userData?.city,
        email: userData?.auth?.email,
      };
      // send reward
      await rewardReferrer(userID, "identityVerified");
      trackEvents(
        user?.customData?.hash,
        "Add Payment Method",
        payloadAddPayment
      );

      // also lets track the user in customerio
      await axios.post(
        "https://kinscare-backend.onrender.com/api/v1/auth/track_customerio_event",
        {
          userID,
          eventName: "IdentityVerified",
          data: {
            lname: userData?.lname,
            fname: userData?.fname,
            tel: userData?.auth?.tel,
            zipcode: userData?.zipcode,
            city: userData?.city,
            email: userData?.auth?.email,
            trial: true, // this tells the user that he's in free trial
          },
        }
      );
      // Create the subscription with the backend API
      // const subscription = await createSubscription();

      // Success! Notify parent component
      onSuccess({ paymentMethodID });
      setMessage("free trial started!");

      // we would fetch the userData and update the context
      const user_data: any = await fetchUserData(
        user.customData.userID,
        user.customData.email
      );
      if (user_data) {
        await setUserData(user_data.result); // set the user data
        user.refreshCustomData();
        setIsTrialExpired(false);
        // router.refresh();
        setIsLoading(false);
        window.location.reload();
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
        <Button
          className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-violet-800 hover:-translate-y-1"
          disabled={isLoading || !stripe || !elements}
          id="submit"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Verify Identity
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

export default PaymentForm;

// This function Only helps add Payment Card for verification, it doe not subscribe the user to any plan.
