"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import FreeTrialPayment from "./FreeTrialPayment";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  convertISODateToNormal,
  fetchContactsData,
  isTrialActive,
} from "@/lib/utils";
import PricingPlan from "./PricingPlan";
import SubscriptionDetails from "./SubscriptionDetails";

function AccountSettings() {
  const mongo: any = useContext(MongoContext);
  const { user, customData, userData, setUser, setCustomData } = mongo;
  console.log(customData, "cusoomt");
  // State to track free trial modal visibility and client secret
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("client_secret") : null
  );
  const [subscriptionData, setSubscriptionData] = useState(null);
  useEffect(() => {
    const fetchCustomData = async () => {
      const fetchedData: any = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      if (fetchedData) {
        // console.log(fetchedData.result, "rewsulet")
        await setCustomData(fetchedData.result);
      }
    };
    fetchCustomData();
    if(customData){
      fetchSubscriptionData()
    }
  }, [user]);

  const trialActive = isTrialActive(
    customData.trial_start_date,
    customData.trial_end_date
  );
  // const freeTrial = false; // Simulating no active trial for demonstration
  const handleStartTrial = async () => {
    // if (!user?.customData?.customer_id) {
    //   console.error("Customer ID is not available!");
    //   return;
    // }

    // try {
    //   // Call the API to create setup intent and get client_secret
    //   const response = await axios.post(
    //     "https://api.kinscare.org/api/v1/providers/create-setup-intent",
    //     {
    //       customerId: customData.customer_id,
    //     }
    //   );

    //   console.log(response.data);
    //   const { clientSecret } = response.data;
    //   setClientSecret(clientSecret);

    //   // Store the client secret in localStorage to persist across reloads
    //   localStorage.setItem("client_secret", clientSecret);

    //   // Open the dialog/modal
    //   setIsDialogOpen(true);
    // } catch (error) {
    //   console.error("Error creating setup intent:", error);
    // }
    setIsDialogOpen(true);
  };
  console.log(trialActive, customData.subscribed, "trial");

  const fetchSubscriptionData = async () => {
    try {
      const getSubData = await axios.get(
        `https://api.kinscare.org/api/v1/providers/subscription/${customData.customer_id}`
      );
      setSubscriptionData(getSubData.data.subscription);
      // console.log(getSubData.data.subscription)
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  const closePricingDialog = () => {
    setIsDialogOpen(false);
  };
  return (
 <div className="bg-gray-50 min-h-screen">
  <div className="py-8 lg:py-12">
    <div className="max-w-7xl mx-auto py-10 px-6 sm:px-8 md:px-12">
      <div className="flex flex-col space-y-8">
        {/* Account Information */}
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h2 className="font-bold tracking-tight text-lg text-gray-800 mb-4">Account Information</h2>
          {userData ? (
            <div className="flex text-sm flex-col space-y-2 text-gray-600">
              {userData?.name && <p className="font-medium ">{userData.name}</p>}
              <p>
                {userData.address}, {userData.city}, {userData.zipcode}
              </p>
            </div>
          ) : null}
          <Link href="/provider/account/settings/profile">
            <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 transition px-4 py-2 rounded-md">
              Update Profile
            </Button>
          </Link>
        </div>

        {/* Your Plan */}
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h2 className="font-bold text-lg tracking-tight text-gray-800 mb-4">Your Plan</h2>
          {trialActive && !customData.subscribed ? (
            <>
              <p className="text-gray-600 text-sm mb-2">Free trial</p>
              <p className="text-gray-500 text-sm">
                Trial period ends on{" "}
                <span className="font-semibold">
                  {convertISODateToNormal(customData?.trial_end_date)}
                </span>
              </p>
            </>
          ) : !trialActive && customData.subscribed && subscriptionData ? (
            <SubscriptionDetails subscription={subscriptionData} />
          ) : (
            <div>
              <p className="text-gray-500 text-sm mb-4">Pay to access premium features</p>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 transition px-6 py-3 rounded-md"
                onClick={handleStartTrial}
              >
                Start Plan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog/Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <PricingPlan closePricingDialog={closePricingDialog} />
        </DialogContent>
      </Dialog>
    </div>
  </div>
</div>

  );
}

export default AccountSettings;
