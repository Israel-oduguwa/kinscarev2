"use client";

import React, { useContext, useState, useEffect } from "react";
import MongoContext from "@/app/MongoContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Loader2, Trash } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../User/PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { isTrialActive } from "@/lib/utils";
import { EmailIcon } from "next-share";
import { toast } from "@/components/ui/use-toast";

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_TEST_KEY || "");
function ProtectedCandidatesDetails({
  email,
  name,
  tel,
}: {
  email: string;
  tel: string;
  name: string;
}) {
  const { user, userData }: any = useContext(MongoContext);
  const [isTrialExpired, setIsTrialExpired] = useState(
    !(user?.customData?.trial || user?.customData?.subscribed)
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>("monthly");
  const [removedBlur, setRemoveBlur] = useState();
  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<
    {
      isDefault: any;
      isExpired: any;
      id: string;
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    }[]
  >([]);
  // stripe theme
  const appearance: any = {
    theme: "flat",
  };

  const openTrialDialogBox = async () => {
    const trialStart = user?.customData?.trial_start_date;
    const trialEnd = user?.customData?.trial_end_date;
    const isSubscribed = user?.customData?.subscribed;

    if (trialStart && trialEnd) {
      const trialActive = isTrialActive(trialStart, trialEnd);
      // open the payment subscribe modal
      setIsDialogOpen(true);
    } else {
      try {
        const response = await axios.post(
          "https://api.kinscare.org/api/v1/providers/create-setup-intent",
          {
            customerId: user.customData.customer_id,
          }
        );
        console.log(response.data);
        const { clientSecret } = response.data;
        // Store the client secret in localStorage to persist across reloads
        localStorage.setItem("client_secret", clientSecret);
        setClientSecret(clientSecret);
        // console.log(response)
        // Close the dialog after sending
        const isNotVerified = !(
          user?.customData?.trial === true ||
          user?.customData?.subscribe === true
        );
        if (isNotVerified) {
          setIsTrialDialogOpen(true);
        }
      } catch (error) {}
    }
  };
  const closeTrialDialogBox = () => {
    setIsTrialDialogOpen(false);
  };
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  // console.log(isTrialExpired);
  // Open dialog if trial has expired
  useEffect(() => {
    const trialStart = user?.customData?.trial_start_date;
    const trialEnd = user?.customData?.trial_end_date;
    const isSubscribed = user?.customData?.subscribed;

    if (isSubscribed) {
      // If subscribed, the trial is irrelevant
      setIsTrialExpired(false);
      return;
    }
    if (trialStart && trialEnd) {
      // Calculate trial status based on dates
      const trialActive = isTrialActive(trialStart, trialEnd);
      setIsTrialExpired(!trialActive);
    } else {
      // Fallback if no trial dates exist
      const trialFlag = user?.customData?.trial || false;
      setIsTrialExpired(!trialFlag);
    }
  }, [user]);

  // Fetch saved cards when the dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchSavedCards();
    }
  }, [isDialogOpen]);

  const fetchSavedCards = async () => {
    try {
      const customerId = user.customData.customer_id;
      const response = await axios.post(
        `https://api.kinscare.org/api/v1/providers/payment-methods`,
        { customerId }
      );

      if (response.data.success) {
        const cards = response.data.data.map((card: any) => ({
          id: card.id,
          brand: card.card.brand,
          last4: card.card.last4,
          exp_month: card.card.exp_month,
          exp_year: card.card.exp_year,
        }));
        setSavedCards(cards);

        // Default to the first card if available
        if (cards.length > 0) {
          setSelectedCard(cards[0].id);
        }
      } else {
        console.error("Failed to fetch saved cards:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error fetching saved cards:", error.message);
    }
  };

  const getPriceIdByPlan = (plan: "daily" | "weekly" | "monthly"): string => {
    const priceIds = {
      daily: "price_1QSCmtAoahxG9SLG2kga6E01",
      weekly: "price_1QSCneAoahxG9SLGCHhFdN4C",
      monthly: "price_1QP2OuAoahxG9SLGNoc37Lxo",
    };

    if (!priceIds[plan]) {
      throw new Error(
        "Invalid plan selected. Please choose daily, weekly, or monthly."
      );
    }

    return priceIds[plan];
  };

  const createSubscription = async () => {
    if (!selectedCard) {
      console.error("No card selected.");
      return;
    }

    const customerId = user.customData.customer_id;
    const priceId = getPriceIdByPlan(selectedPlan);

    try {
      setLoading(true);
      const payload = {
        customerId,
        priceId,
        paymentMethodId: selectedCard,
      };
      const response = await axios.post(
        "https://api.kinscare.org/api/v1/providers/subscription",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.success) {
        console.log("Subscription created successfully:", response.data);
        const subscription = response.data.subscription;
        // Step 2: Update the database using the CRUD operation API
        const updatePayload = {
          collectionName: "contacts", // Adjust collection name as needed
          operation: "updateOne", // Specify operation type
          filter: { userID: userData.userID, role: "provider" }, // Customize filter
          update: {
            $set: {
              subscription_id: subscription.id, // Save subscription ID
              subscribed: true, // Mark user as subscribed
              trial: "expired", // Mark trial as expired
              subscription_start_date: new Date(
                subscription.start_date * 1000
              ).toISOString(), // Start date in ISO format
              subscription_status: subscription.status, // Subscription status
              plan_id: subscription.plan.id, // Save the plan ID
              payment_verified: true, // Optionally set payment verified
            },
          },
        };
        const crudResponse = await axios.post(
          "https://api.kinscare.org/api/v1/auth/crud-operation",
          updatePayload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(crudResponse);
        if (crudResponse.data.success) {
          console.log("User subscription details updated successfully.");
          // Step 3: Refresh user data and the UI
          await user.refreshCustomData();
          router.refresh();
          setIsDialogOpen(false); // Close dialog on success
          router.refresh();
        } else {
          console.error(
            "Failed to update user subscription in the database:",
            crudResponse.data.message
          );
        }
      } else {
        throw new Error(
          response.data.message || "Failed to create subscription."
        );
      }
    } catch (error: any) {
      console.error("Error creating subscription:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSetDefault = (id: string) => {
    setSavedCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? { ...card, isDefault: true }
          : { ...card, isDefault: false }
      )
    );
    setSelectedCard(id);
  };

  const getCardLogo = (brand: string) => {
    switch (brand) {
      case "visa":
        return (
          <img
            src="https://app.card-logo.com/uploads/thumbnail/128px/e0b4cdc54800b9d7abcb9c012990662978eb39d4.png"
            alt="Visa Logo"
            className="h-8"
          />
        );
      case "mastercard":
        return (
          <img
            src="https://app.card-logo.com/uploads/thumbnail/128px/d51f7a234af740dcf1ad7dc9619e18c065a31cf7.png"
            alt="Mastercard Logo"
            className="h-8"
          />
        );
      default:
        return null;
    }
  };

  const obfuscateText = (text: string): string => {
    // Check if the input is an email
    if (text.includes("@")) {
      const [localPart, domain] = text.split("@");
      if (localPart.length <= 2) return text; // Skip short emails
      const obfuscatedLocalPart = `${localPart.slice(0, 3)}${"*".repeat(
        Math.max(localPart.length - 6, 0)
      )}${localPart.slice(-3)}`;
      return `${obfuscatedLocalPart}@${domain}`;
    }

    // If not an email, treat as a name
    const words = text.split(" ");
    return words
      .map((word) => {
        if (word.length <= 2) return word;
        const firstPart = word.slice(0, 3);
        const lastPart = word.slice(-3);
        const middlePart = "*".repeat(
          word.length - firstPart.length - lastPart.length
        );
        return `${firstPart}${middlePart}${lastPart}`;
      })
      .join(" ");
  };
const handleOnSuccess = () =>{
  toast({
    title: "Error",
    description:"Payment Details verified successfully",
    variant: "default",
  });
}
  const encryptedEmail = obfuscateText(email);
  const encryptedTel = obfuscateText(tel);
  // console.log(isTrialExpired)
  return (
    <>
      <h2 className="text-sm font-semibold">Contacts Information</h2>
      <div className="space-y-2 mt-1">
        {isTrialExpired ? (
          <div className="space-y-3">
            {/* Encrypted Email and Phone */}
            <div className="space-y-2 max-w-sm">
              <p
                className={`text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200`}
              >
                {encryptedEmail}
              </p>
              <p
                className={`text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200`}
              >
                {encryptedTel}
              </p>
            </div>
            {/* Reveal Contacts Message */}
            <p className="text-sm font-medium text-gray-600">
              Click the **Reveal Contacts** button below to view {name}'s email
              and phone number.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-w-sm">
            {/* Visible Email and Phone */}
            <p className="text-sm px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200">
              {email}
            </p>
            <p className="text-sm px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200">
              {tel}
            </p>
          </div>
        )}

        {/* Reveal Contacts Button */}
        {isTrialExpired && (
          <Button
            size="sm"
            onClick={openTrialDialogBox}
            className="w-full md:w-auto px-6 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition duration-200"
          >
            Reveal Contacts
          </Button>
        )}
      </div>

      {/* Dialog Box Payment */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl mx-auto bg-gradient-to-b from-blue-50 via-white to-gray-50 rounded-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-600 text-center font-extrabold text-xl">
              {!user.customData.subscribedDate && "Your 7-day trial has ended"}
            </DialogTitle>
            <p className="text-gray-600 text-center mt-2 text-sm">
              Don’t miss out on connecting with the right caregivers for your
              residents!
            </p>
          </DialogHeader>

          <div className="mt-1 px-6 text-center">
            <p className="text-gray-700 text-center text-sm leading-relaxed">
              To continue enjoying Kinscare’s services, it’s time to choose a
              plan that works for you. Unlike subscriptions, Kinscare offers a
              <span className="font-semibold text-blue-600">
                {" "}
                flexible, pay-as-you-go approach
              </span>
              —just like Uber—designed to meet your needs without long-term
              commitments.
            </p>

            {/* Sliding Tab for Plan Selection */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="flex space-x-1 bg-gray-100 p-2 rounded-full">
                  <button
                    className={`w-1/3 text-sm font-semibold py-2 px-4 rounded-full ${
                      selectedPlan === "monthly"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600"
                    } transition`}
                    onClick={() => setSelectedPlan("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`w-1/3 text-sm font-semibold py-2 px-4 rounded-full ${
                      selectedPlan === "weekly"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600"
                    } transition`}
                    onClick={() => setSelectedPlan("weekly")}
                  >
                    Weekly
                  </button>
                  <button
                    className={`w-1/3 text-sm font-semibold py-2 px-4 rounded-full ${
                      selectedPlan === "daily"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600"
                    } transition`}
                    onClick={() => setSelectedPlan("daily")}
                  >
                    Daily
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {/* Left Side - Saved Cards */}
              <div className="space-y-4">
                {/* Saved Card Options */}
                {savedCards.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {savedCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => handleSetDefault(card.id)}
                        className={`flex items-center cursor-pointer justify-between p-4 rounded-lg ${
                          card.isExpired ? "bg-gray-200" : "bg-white"
                        } shadow-sm border ${
                          card.isDefault ? "border-blue-500" : "border-gray-300"
                        } mb-4`}
                      >
                        {/* Card Info */}
                        <div className="flex items-center space-x-4">
                          {getCardLogo(card.brand)}
                          <div>
                            <p className="font-xs font-semibold antialiased text-sm text-gray-800 capitalize">
                              use {card.brand} card ending with {card.last4}
                            </p>
                            <p className="text-xs text-gray-500">
                              Exp.date {String(card.exp_month).padStart(2, "0")}
                              /{card.exp_year}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                          {card.isDefault ? (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          ) : card.isExpired ? (
                            <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                              Expired
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefault(card.id)}
                              className="text-blue-600 text-xs font-semibold hover:underline"
                            >
                              Use card
                            </button>
                          )}
                          <Button
                            onClick={() =>
                              setSelectedCard((prev: any) =>
                                prev.filter((c: any) => c.id !== card.id)
                              )
                            }
                            variant="ghost"
                            size="icon"
                            className="text-blue-700 hover:text-blue-700"
                          >
                            <Trash className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-6">
                    No saved cards found. Please add a payment method in your
                    account.
                  </p>
                )}
                <p className="text-gray-700 text-sm leading-relaxed mt-3">
                  Every dollar you invest goes directly into recruiting
                  qualified local caregivers, ensuring that your residents
                  continue to receive the exceptional care they deserve.
                </p>
                {/* Add Another Card Button */}
                {/* <button
                  onClick={handleAddCard}
                  className="mt-4 text-blue-600 hover:underline text-sm"
                >
                  Add another card
                </button> */}
              </div>

              {/* Right Side - Additional Content */}
              <div className="bg-gray-100 p-6 rounded-xl">
                <div className="flex flex-col w-full">
                  <h4 className="text-sm font-semibold antialiased tracking-tight mb-3">
                    Summary
                  </h4>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between w-full">
                      <p className="text-sm font-semibold">Plan</p>
                      <p className="text-sm text-gray-500">{selectedPlan}</p>
                    </div>
                    <div className="flex justify-between w-full">
                      <p className="text-sm font-semibold">Amount</p>
                      <p className="text-sm">
                        {selectedPlan === "daily"
                          ? "$ 10"
                          : selectedPlan === "weekly"
                          ? "$ 20"
                          : "$ 50"}
                      </p>
                    </div>
                    <div className="flex justify-between w-full">
                      <p className="font-bold text-sm">Plan</p>
                      <p className="text-sm">{selectedPlan}</p>
                    </div>
                    <div className="flex justify-between w-full">
                      <p className="font-bold text-sm">Plan</p>
                      <p className="text-sm">{selectedPlan}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <Button
                    className={`${
                      selectedCard
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    } transition rounded px-8 py-4 flex items-center shadow-lg`}
                    onClick={createSubscription}
                    disabled={!selectedCard}
                  >
                    {loading && <Loader2 className="animate-spin" />}
                    <CreditCard className="mr-2" />
                    Activate Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Activate Plan Button */}

          <DialogFooter>
            <p className="text-sm text-gray-500 text-center mt-6">
              You can cancel anytime, hassle-free.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trial DialogBox  */}
      <Dialog open={isTrialDialogOpen} onOpenChange={setIsTrialDialogOpen}>
        <DialogContent className=" max-w-[720px] mx-auto p-6 bg-white rounded-lg shadow-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center text-center">
              <div className="mb-3">
                <CreditCard className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="font-bold text-2xl text-gray-800">
                Get Verified as a Provider
              </h2>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-gray-600">
            <p className="text-sm">
              To create a safe and professional environment for caregivers, we
              require a valid payment method. This confirms that you’re a
              genuine employer with sincere intent to hire {name}
            </p>
            <p className="text-sm text-red-500">Your card will not be charged.            </p>
          </div>
          <div className="mt-4">
            <p className="text-sm mb-4">
              Add your details now to continue your search safely and securely!
            </p>
            {clientSecret && userData ? (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance }}
              >
                <PaymentForm
                  close={closeTrialDialogBox}
                  setIsTrialExpired={setIsTrialExpired}
                  clientSecret={clientSecret}
                  userID={userData.userID}
                  customerId={user?.customData?.customer_id}
                  priceId="price_1QP2OuAoahxG9SLGNoc37Lxo"
                  intentType="setup"
                  onSuccess={(result) => {
                    handleOnSuccess()
                   
                  }}
                  onError={(error) => {
                    console.error("Error saving card:", error);
                  }}
                />
              </Elements>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <p className="mt-4 text-xs text-center text-gray-500">
            By adding your payment details, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProtectedCandidatesDetails;

// The Blur Version 
// <div className="space-y-4 mt-4">
// {isTrialExpired ? (
//   <div className="space-y-3">
//     {/* Encrypted Email and Phone */}
//     <div className="space-y-2">
//       <p
//         className={`text-sm px-4 py-2 rounded-md ${
//           isTrialExpired
//             ? "blur-sm bg-gray-100 text-gray-500 cursor-not-allowed"
//             : "bg-white text-gray-800"
//         } transition duration-300 ease-in-out`}
//       >
//         {isTrialExpired ? encryptedEmail : email}
//       </p>
//       <p
//         className={`text-sm px-4 py-2 rounded-md ${
//           isTrialExpired
//             ? "blur-sm bg-gray-100 text-gray-500 cursor-not-allowed"
//             : "bg-white text-gray-800"
//         } transition duration-300 ease-in-out`}
//       >
//         {isTrialExpired ? encryptedTel : tel}
//       </p>
//     </div>
//     {/* Reveal Contacts Message */}
//     <p className="text-sm font-medium text-gray-700">
//       Click the **Reveal Contacts** button below to view {name}'s email
//       and phone number.
//     </p>
//   </div>
// ) : (
//   <div className="space-y-2">
//     {/* Visible Email and Phone */}
//     <p className="text-sm px-4 py-2 rounded-md bg-white text-gray-800">
//       {email}
//     </p>
//     <p className="text-sm px-4 py-2 rounded-md bg-white text-gray-800">
//       {tel}
//     </p>
//   </div>
// )}

// {/* Reveal Contacts Button */}
// {isTrialExpired && (
//   <Button
//     size="sm"
//     onClick={openTrialDialogBox}
//     className="w-full md:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200"
//   >
//     Reveal Contacts
//   </Button>
// )}
// </div>