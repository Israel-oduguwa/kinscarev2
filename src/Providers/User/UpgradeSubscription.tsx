"use client";

import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/hooks/useApiClient";

const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY ?? "";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const pricingPlans = [
  {
    id: "weekly",
    title: "Weekly Plan",
    price: "$63.99",
    stripePriceId: "price_1SG0IIAoahxG9SLGW3iCYQpb",
    description:
      "Ideal for weekly usage. Enjoy full access for 7 days at a discounted rate.",
    features: ["7-day access", "Full feature set", "24/7 premium support"],
  },
  {
    id: "monthly",
    title: "Monthly Plan",
    price: "$93.99",
    stripePriceId: "price_1SG0FJAoahxG9SLG2zl4tRUp",
    description: "Best value! Get 30 days of unlimited access to all features.",
    features: ["30-day access", "Full feature set", "24/7 premium support"],
  },
];

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
}

interface UpgradeSubscriptionProps {
  closePricingDialog: () => void;
}

const UpgradeSubscription: React.FC<UpgradeSubscriptionProps> = ({
  closePricingDialog,
}) => {
  const { userData, contactData }: any = useAuthContext();
  const [availablePlans, setAvailablePlans] = useState<typeof pricingPlans>([]);
  const [selectedPlan, setSelectedPlan] = useState<
    (typeof pricingPlans)[0] | null
  >(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [openCardDialog, setOpenCardDialog] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchingSavedCard, setFetchingSavedCard] = useState(false);
  const { privateApi } = useApiClient();
  /**
   * Fetch subscription data and filter available plans based on the current plan.
   */
  const fetchSubscriptionData = useCallback(async () => {
    try {
      const response = await privateApi.get(
        `/api/v1/providers/subscription/${contactData.customer_id}`
      );
      setSubscriptionData(response.data.subscription);

      // Filter plans: Only show plans that are "above" the current plan
      const currentPlan = contactData.plan; // e.g., "weekly"
      const filteredPlans = pricingPlans.filter(
        (plan) => plan.id !== currentPlan
      );
      setAvailablePlans(filteredPlans);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    }
  }, [contactData.customer_id, contactData.plan]);

  /**
   * Fetch saved cards for the user.
   */
  const fetchSavedCards = useCallback(async () => {
    try {
      setFetchingSavedCard(true);
      const response = await privateApi.post(
        "/api/v1/providers/payment-methods",
        {
          customerId: contactData.customer_id,
        }
      );

      if (response.data.success) {
        setSavedCards(
          response.data.data.map((card: any) => ({
            id: card.id,
            brand: card.card.brand,
            last4: card.card.last4,
            exp_month: card.card.exp_month,
            exp_year: card.card.exp_year,
            isDefault: card.default,
          }))
        );
        setSelectedCard(response.data.data[0]?.id ?? null); // Pre-select the first card
        setFetchingSavedCard(false);
      }
    } catch (error) {
      setFetchingSavedCard(false);
      console.error("Error fetching saved cards:", error);
    }
  }, [contactData.customer_id]);

  /**
   * Upgrade subscription using a saved card.
   */
  const handleUpgradeWithSavedCard = async () => {
    if (!selectedCard || !selectedPlan) {
      alert("Please select a card and plan to proceed.");
      return;
    }

    setLoading(true);
    try {
      await privateApi.post("/api/v1/providers/subscription/upgrade", {
        subscriptionId: subscriptionData.id,
        priceId: selectedPlan.stripePriceId,
        paymentMethodId: selectedCard,
      });

      // alert(`Successfully upgraded to the ${selectedPlan.title}!`);
      const userID = contactData.userID;
      const payload = {
        collectionName: "contacts",
        operation: "updateOne",
        filter: { userID, role: "provider" },
        update: {
          $set: {
            plan: selectedPlan.id,
          },
        },
      };

      await privateApi.post("/api/v1/auth/crud-operation", payload, {
        headers: { "Content-Type": "application/json" },
      });
      setTimeout(() => {
        window.location.reload(); // Reload after the delay
        close();
        setLoading(false);
        setOpenCardDialog(false);
      }, 3000); // 3-second delay
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      alert("Failed to upgrade subscription. Please try again.");
    } finally {
    }
  };

  /**
   * Prepare for upgrading with a new card.
   */
  const prepareUpgradeWithNewCard = async () => {
    if (!selectedPlan) {
      alert("Please select a plan first.");
      return;
    }

    setLoading(true);
    try {
      const response = await privateApi.post(
        "/api/v1/providers/create-setup-intent",
        {
          customerId: contactData?.customer_id,
        }
      );
      const { clientSecret } = response.data;
      // localStorage.setItem("client_secret", clientSecret);
      setClientSecret(clientSecret); // Save clientSecret for Stripe Elements
      setOpenPaymentForm(true); // Open the payment form for the user to enter card details
      setOpenCardDialog(false); // Close the saved cards dialog
    } catch (error) {
      console.error("Error creating SetupIntent:", error);
      alert("Failed to prepare payment with a new card.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle plan selection to open the saved cards dialog.
   */
  const handleSelectPlan = (plan: (typeof pricingPlans)[0]) => {
    setSelectedPlan(plan);
    setOpenCardDialog(true); // Open the dialog for selecting a payment method
    fetchSavedCards(); // Fetch the saved cards
  };

  useEffect(() => {
    fetchSubscriptionData(); // Fetch subscription data on load
  }, [fetchSubscriptionData]);

  return (
    <div className="py-10 space-y-8">
      <div>
        <h2 className="text-3xl mb-2 font-bold text-center text-gray-700">
          Upgrade Your Subscription
        </h2>
        <p className="text-sm text-center text-gray-600">
          Upgrade your subscription to enjoy more value for less
        </p>
      </div>
      {/* Pricing Plans */}
      <div className="grid grid-cols-1  sm:grid-cols-2 gap-6 px-4 sm:px-6 lg:px-8">
        {availablePlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-2 cursor-pointer ${
              plan.id === "monthly"
                ? "bg-[hsl(var(--accent))] scale-105 border-2 border-[hsl(var(--primary))] shadow-2xl" // Highlight Monthly Plan
                : "bg-[hsl(var(--card))]"
            }`}
            onClick={() => handleSelectPlan(plan)}
          >
            {plan.id === "monthly" && (
              <div
                className={`h-2 ${
                  plan.id === "monthly"
                    ? "bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]"
                    : "bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"
                }`}
              />
            )}
            <div className="p-8">
              <h3 className="text-xl font-bold">{plan.title}</h3>
              <p className="text-4xl font-extrabold text-blue-600 mt-4">
                {plan.price}
              </p>
              <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="text-sm flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 17.414l-5.707-5.707 1.414-1.414L10 14.586l8.293-8.293 1.414 1.414z" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full">Choose plan</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Saved Cards Dialog */}
      <Dialog open={openCardDialog} onOpenChange={setOpenCardDialog}>
        <DialogContent className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800">
            Choose Payment Method
          </h3>
          {fetchingSavedCard ? (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {savedCards.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card.id)}
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition hover:shadow-lg ${
                        selectedCard === card.id
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--secondary))]"
                          : "border-[hsl(var(--border))]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <CardImage cardBrand={card.brand} />
                        <div>
                          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                            Use {card.brand} card ending in {card.last4}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            Exp {String(card.exp_month).padStart(2, "0")}/
                            {card.exp_year}
                          </p>
                        </div>
                      </div>
                      {selectedCard === card.id && (
                        <span className="text-sm text-[hsl(var(--primary))] font-medium">
                          Selected
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-4">
                  No saved cards available.
                </p>
              )}
            </>
          )}
          <div className="mt-6 space-y-4">
            <Button
              onClick={handleUpgradeWithSavedCard}
              disabled={loading || !selectedCard}
              className="w-full bg-blue-600 text-white"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Pay with Selected Card"
              )}
            </Button>
            {/* <Button
              onClick={prepareUpgradeWithNewCard}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Pay with New Card"
              )}
            </Button> */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Form Dialog */}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentWithCard
            clientSecret={clientSecret}
            userID={contactData.userID}
            subscriptionData={subscriptionData}
            setClientSecret={setClientSecret}
            selectedPlan={selectedCard}
            openPaymentForm={openPaymentForm}
            setOpenPaymentForm={setOpenPaymentForm}
          />
        </Elements>
      )}
    </div>
  );
};

export default UpgradeSubscription;

const PaymentWithCard = ({
  clientSecret,
  selectedPlan,
  userID,
  subscriptionData,
  setClientSecret,
  openPaymentForm,
  setOpenPaymentForm,
}: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { privateApi } = useApiClient();
  const handleNewCardSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      alert("Stripe is not properly initialized.");
      return;
    }

    setLoading(true);

    try {
      // Confirm the SetupIntent using Stripe Elements
      const { setupIntent, error }: any = await stripe.confirmSetup({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });
      // console.log(setupIntent);
      if (error) {
        console.log(error);
        console.error("Error confirming SetupIntent:", error.message);
        alert("Failed to save the card. Please try again.");
        return;
      }
      setClientSecret(null);
      if (setupIntent?.status === "succeeded") {
        // console.log("s");
        // Get the paymentMethodId from the confirmed SetupIntent
        const paymentMethodId = setupIntent.payment_method;

        // Send the paymentMethodId to the backend to upgrade the subscription
        const send = await privateApi.post(
          "/api/v1/providers/subscription/upgrade",
          {
            subscriptionId: subscriptionData.id,
            priceId: selectedPlan.stripePriceId,
            paymentMethodId,
          }
        );
        // console.log(send);
        const payload = {
          collectionName: "contacts",
          operation: "updateOne",
          filter: { userID, role: "provider" },
          update: {
            $set: {
              plan: selectedPlan.id,
            },
          },
        };

        await privateApi.post("/api/v1/auth/crud-operation", payload, {
          headers: { "Content-Type": "application/json" },
        });
        setTimeout(() => {
          window.location.reload(); // Reload after the delay
          close();
          setLoading(false); // Ensure loading state is turned off
        }, 3000); // 3-second delay
      }
    } catch (error) {
      console.error("Error confirming SetupIntent:", error);
      alert("Failed to save the card and upgrade the subscription.");
    } finally {
    }
  };

  return (
    <Dialog open={openPaymentForm} onOpenChange={setOpenPaymentForm}>
      <DialogContent>
        <form onSubmit={handleNewCardSubmit} className="space-y-6">
          <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
          <div className="flex justify-end">
            <Button disabled={loading || !stripe || !elements}>
              {loading && <Loader2 className="animate-spin mr-2" />} Pay
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface CardImageProps {
  cardBrand: string;
}

const CardImage: React.FC<CardImageProps> = ({ cardBrand }) => {
  switch (cardBrand.toLowerCase()) {
    case "visa":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/e0b4cdc54800b9d7abcb9c012990662978eb39d4.png"
          width="35"
          height="20"
          alt="Visa Logo"
        />
      );
    case "mastercard":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/d51f7a234af740dcf1ad7dc9619e18c065a31cf7.png"
          width="35"
          height="25"
          alt="MasterCard Logo"
        />
      );
    case "discover":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/f234024cb4dd4dec8b9c5a50c4be65c42e1c7c81.png"
          width="40"
          height="25"
          alt="Discover Logo"
        />
      );
    case "amex":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/7ab837ba11d7a170120f8a2a546d3d37870f081e.png"
          width="40"
          height="25"
          alt="Amex Logo"
        />
      );
    case "jcb":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/7973b75eccf5f9bd39414dff7d8a734d072f9d05.png"
          width="40"
          height="25"
          alt="JCB Logo"
        />
      );
    case "unionpay":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/2a3f776d378871b45bb428034aad481a13adeb49.png"
          width="40"
          height="25"
          alt="UnionPay Logo"
        />
      );
    default:
      // Fallback or generic card image
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/e0b4cdc54800b9d7abcb9c012990662978eb39d4.png"
          width="40"
          height="25"
          alt="Generic Card Logo"
        />
      );
  }
};
