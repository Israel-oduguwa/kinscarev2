"use client";

import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MongoContext from "@/app/MongoContext";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FreeTrialPayment from "./FreeTrialPayment";
import { Loader } from "lucide-react";

interface RestrictAccessProps {
  children: React.ReactNode; // Components to render if access is allowed
  mode?: "wrap" | "trigger"; // Determines behavior: wrap a page or show modal on interaction
}

const RestrictAccess: React.FC<RestrictAccessProps> = ({ children, mode = "wrap" }) => {
  const mongo: any = useContext(MongoContext); // Context to fetch user data
  const { user, userData } = mongo || {};
  const router = useRouter();

  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch client secret for free trial payment modal
  const fetchClientSecret = async () => {
    if (user?.customData?.customer_id && !clientSecret) {
      try {
        setLoading(true);
        const response = await axios.post(
          "https://api.kinscare.org/api/v1/providers/create-setup-intent",
          {
            customerId: user.customData.customer_id,
          }
        );
        const { clientSecret } = response.data;
        setClientSecret(clientSecret);
        console.log(clientSecret)
        localStorage.setItem("client_secret", clientSecret);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast({
          title: "Error",
          description:
            "Failed to initiate the free trial. Please try again later.",
          variant: "destructive",
        });
        console.error("Error fetching client secret:", error);
      }
    }
  };

  // Trial logic only applies in "wrap" mode
  useEffect(() => {
    if (mode === "wrap" && user !== undefined) {
      const trialState = user?.customData?.trial; // true, false, or "expired"

      if (trialState === false) {
        setIsTrialDialogOpen(true); // No trial, show free trial modal
        fetchClientSecret();
      } else if (trialState === "expired") {
        setIsPricingDialogOpen(true); // Expired trial, show pricing modal
      }
    }
  }, [userData, mode]);

  const handleInteraction = () => {
    // Trigger modal logic in "trigger" mode
    const trialState = user?.customData?.trial;

    if (trialState === false) {
      setIsTrialDialogOpen(true);
      fetchClientSecret();
    } else if (trialState === "expired") {
      setIsPricingDialogOpen(true);
    }
  };

  // Render children (protected content) if trial is active
  if (mode === "wrap" && userData?.trial === true) {
    return <>{children}</>;
  }

  return (
    <>
      {mode === "trigger" && (
        // Render a trigger button or link in "trigger" mode
        <button
          onClick={handleInteraction}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Access Restricted Content
        </button>
      )}

      {/* Free Trial Modal */}
      <Dialog open={isTrialDialogOpen} >
  <DialogContent className="max-w-[600px]">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold flex justify-between items-center">
        Start Free Trial
        {/* <button
          onClick={() => setIsTrialDialogOpen(false)} // Close modal only on this button
          className="text-gray-600 hover:text-gray-800 transition"
        >
          ✕
        </button> */}
      </DialogTitle>
    </DialogHeader>
    <div className="mt-4 space-y-4">
      {loading ? (
        <div className="animate-spin">
          <Loader />
        </div>
      ) : (
        clientSecret && (
          <FreeTrialPayment
            clientSecret={clientSecret}
            onClose={() => setIsTrialDialogOpen(false)} // Optionally close when FreeTrialPayment logic completes
          />
        )
      )}
    </div>
  </DialogContent>
</Dialog>

{/* Pricing Page Modal (for expired trial) */}
<Dialog open={isPricingDialogOpen} >
  <DialogContent className="fixed inset-0 flex items-center justify-center max-w-[600px]">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold flex justify-between items-center">
        Subscribe to Continue
        <button
          onClick={() => setIsPricingDialogOpen(false)} // Close modal only on this button
          className="text-gray-600 hover:text-gray-800 transition"
        >
          ✕
        </button>
      </DialogTitle>
    </DialogHeader>
    <div className="mt-4 space-y-4">
      <p className="text-gray-600">
        Your free trial has ended. Subscribe now to regain access to premium features.
      </p>
      <div className="space-y-4">
        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          onClick={() => router.push("/pricing")}
        >
          View Pricing
        </button>
      </div>
    </div>
  </DialogContent>
</Dialog>

      {/* Render children only in "wrap" mode */}
      {mode === "wrap" && userData?.trial === true && children}
    </>
  );
};

export default RestrictAccess;
