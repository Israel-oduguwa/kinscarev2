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
  const { user, userData, setUser } = mongo;

  // State to track free trial modal visibility and client secret
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("client_secret") : null
  );
  const [subscriptionData, setSubscriptionData] = useState(null)
 useEffect(() => {
  if(user.customData){
    fetchSubscriptionData()
  }
 }, [user])
 
  const trialActive = isTrialActive(
    user.customData.trial_start_date,
    user.customData.trial_end_date
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
    //       customerId: user.customData.customer_id,
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
  console.log(trialActive, user.customData.subscribed, "trial");
 
  const fetchSubscriptionData = async () => {
    try {
      const getSubData = await axios.get(`https://api.kinscare.org/api/v1/providers/subscription/${user.customData.customer_id}`);
      setSubscriptionData(getSubData.data.subscription);
      // console.log(getSubData.data.subscription)
    } catch (error) {
      console.log(error)
    }finally{
      
    }
  }
  return (
    <div className="bg-gray-100 min-h-[100vh]">
      <div className="py-6 lg:py-10">
        <div className="max-w-6xl mx-auto py-8 px-4 md:px-10">
          <div className="flex flex-col space-y-6">
            {/* Account Information */}
            <div className="bg-white shadow-md rounded-md p-6">
              <h2 className="font-bold text-xl mb-3">Account Information</h2>
              {userData ? (
                <div className="flex flex-col space-y-1 mb-4">
                  {userData?.name && <p className="">{userData.name}</p>}
                  <p className="">
                    {userData.address} {userData.city}, {userData.zipcode}
                  </p>
                </div>
              ) : (
                <></>
              )}
              <Link href="/provider/account/settings/profile">
                <Button>Update Profile</Button>
              </Link>
            </div>

            {/* Your Plan */}
            <div className="bg-white shadow-md rounded-md p-6">
              
              {trialActive && !user.customerData.subscribed && (
                <>
                <h2 className="font-bold text-xl mb-3">Your Plan</h2>
                  {" "}
                  <p className="">Free trial</p>
                  <p className="">
                    Trial period ends on{" "}
                    {convertISODateToNormal(user.customData?.trial_end_date)}
                  </p>
                </>
              )}
              {!trialActive && user.customData.subscribed && subscriptionData && (
                <SubscriptionDetails subscription={subscriptionData} />
              )}
              {!trialActive && !user.customData.subscribed && (
                <>
                  <p className="mb-3"> Pay to access premium features</p>
                  <Button
                    className=" bg-blue-600 text-white hover:bg-blue-700 transition"
                    onClick={handleStartTrial}
                  >
                    Start Plan
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Dialog/Modal */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="h-[100vh] md:h-auto max-w-5xl overflow-y-auto">
              <PricingPlan />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
