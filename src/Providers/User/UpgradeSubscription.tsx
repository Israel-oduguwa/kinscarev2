"use client";

import React, {
  useContext,
  useState,
  useCallback,
  useEffect,
  FC,
} from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchContactsData } from "@/lib/utils";

// Reuse a payment form from your existing setup if you prefer:
import FrequentPaymentForm from "./FrequentPaymentForm";

/* -------------------------------------------------------------------------- */
/*                               Type Definitions                              */
/* -------------------------------------------------------------------------- */

interface SubscriptionData {
  id?: string;
  // Extend as needed to match your subscription object structure
}

interface PaymentMethodsResponse {
  success: boolean;
  data: Array<{
    id: string;
    card: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
    default: boolean;
  }>;
}

interface CardItem {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
}

interface UserContextType {
  user: {
    customData: {
      customer_id: string;
      userID: string;
      email: string;
    };
    refreshCustomData: () => Promise<void>;
  };
  customData: any;
  setCustomData: (data: any) => void;
}

interface Plan {
  id: string;
  title: string;
  price: string;
  stripePriceId: string;
  level: number; // for sorting “higher plan” logic
}

interface SubscriptionUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Current plan id, e.g. "daily", "weekly", "monthly" */
  currentPlanId: string;
}

/* -------------------------------------------------------------------------- */
/*                        Environment Variable (Safe)                         */
/* -------------------------------------------------------------------------- */

const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_TEST_KEY ?? "";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

/* -------------------------------------------------------------------------- */
/*                          Upgrade Dialog Component                          */
/* -------------------------------------------------------------------------- */

const SubscriptionUpgradeDialog: FC<SubscriptionUpgradeDialogProps> = ({
  isOpen,
  onClose,
  currentPlanId,
}) => {
  // Use your context to get user data, subscription data, etc.
  const { user, customData, setCustomData } = useContext(
    MongoContext
  ) as UserContextType;

  // --- State Management ---
  const [savedCards, setSavedCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isFetchingSecret, setIsFetchingSecret] = useState<boolean>(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState<boolean>(false);
  const [openPaymentForm, setOpenPaymentForm] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [subscriptionId, setSubscriptionId] = useState<string>("");

  // Example plan data including a `level` to help restrict upgrade paths.
  // (level = 1 for daily, 2 for weekly, 3 for monthly, 4 for yearly)
  const availablePlans: Plan[] = [
    {
      id: "daily",
      title: "Daily Plan",
      price: "$23.99",
      stripePriceId: "price_1QXcozAoahxG9SLGGelfYlKJ",
      level: 1,
    },
    {
      id: "weekly",
      title: "Weekly Plan",
      price: "$63.99",
      stripePriceId: "price_1QSCneAoahxG9SLGCHhFdN4C",
      level: 2,
    },
    {
      id: "monthly",
      title: "Monthly Plan",
      price: "$93.99",
      stripePriceId: "price_1QXcpZAoahxG9SLGjWJp4KfP",
      level: 3,
    },
    {
      id: "yearly",
      title: "Yearly Plan",
      price: "$399.99",
      stripePriceId: "price_1XYZabc...", // example placeholder
      level: 4,
    },
  ];

  // Determine the user’s current plan level
  const currentPlan = availablePlans.find((p) => p.id === currentPlanId);
  const currentPlanLevel = currentPlan?.level || 0;

  // Filter out plans that are *lower or equal* to the current plan
  // so user only sees higher-tier plans they can upgrade to.
  const upgradePlans = availablePlans.filter(
    (p) => p.level > currentPlanLevel
  );

  /**
   * 1. Request the subscription client secret from your backend for an upgrade plan.
   */
  const createUpgradeClientSecret = useCallback(
    async (targetPlan: Plan) => {
      setIsFetchingSecret(true);
      try {
        // Your backend might handle “upgrade” logic a bit differently
        // (e.g., pro-rating or immediate upgrade).
        // Adjust to match your endpoint.
        const response = await axios.post(
          "https://api.kinscare.org/api/v1/providers/upgrade-subscription",
          {
            customerId: user.customData.customer_id,
            customerEmail: user.customData.email,
            newPriceId: targetPlan.stripePriceId,
            // Possibly send current subscriptionId or plan ID for reference
          }
        );

        const {
          clientSecret,
          subscriptionId,
          subscription: subscriptionData,
        } = response.data;

        setClientSecret(clientSecret);
        setSubscriptionId(subscriptionId);
        setSubscription(subscriptionData);

        // open saved-cards or payment dialog
        setIsCardDialogOpen(true);

        // fetch saved cards
        void fetchSavedCards();
      } catch (error) {
        console.error("Error requesting upgrade client secret:", error);
      } finally {
        setIsFetchingSecret(false);
      }
    },
    [user?.customData?.customer_id, user?.customData?.email]
  );

  /**
   * 2. Fetch saved cards to let user pick an existing payment method.
   */
  const fetchSavedCards = useCallback(async () => {
    try {
      const response = await axios.post<PaymentMethodsResponse>(
        "https://api.kinscare.org/api/v1/providers/payment-methods",
        {
          customerId: user.customData.customer_id,
        }
      );

      if (response.data.success) {
        const cards: CardItem[] = response.data.data.map((item) => ({
          id: item.id,
          brand: item.card.brand,
          last4: item.card.last4,
          exp_month: item.card.exp_month,
          exp_year: item.card.exp_year,
          isDefault: item.default,
        }));
        setSavedCards(cards);
        if (cards.length > 0) setSelectedCard(cards[0].id);
      }
    } catch (error) {
      console.error("Error fetching saved cards:", error);
    }
  }, [user.customData.customer_id]);

  /**
   * 3. Perform the actual upgrade subscription by providing the chosen card.
   */
  const upgradeSubscription = useCallback(async () => {
    if (!selectedCard || !subscriptionId) return;
    try {
      await axios.post(
        "https://api.kinscare.org/api/v1/providers/upgrade-subscription-finalize",
        {
          subscriptionId,
          paymentMethodId: selectedCard,
          customerId: user.customData.customer_id,
        }
      );
      // Refresh user data
      await user.refreshCustomData();
      const fetchedData = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      if (fetchedData) {
        setCustomData(fetchedData.result);
      }
      handleCloseAll();
    } catch (error) {
      console.error("Error upgrading subscription:", error);
    }
  }, [
    selectedCard,
    subscriptionId,
    user.customData.customer_id,
    user.customData.userID,
    user.customData.email,
    setCustomData,
  ]);

  // 4. Payment form toggles (to add a new card)
  const handleOpenPaymentForm = () => setOpenPaymentForm(true);

  // 5. Close everything
  const handleCloseAll = () => {
    setOpenPaymentForm(false);
    setIsCardDialogOpen(false);
    onClose();
  };

  // Render nothing if no upgrade options exist (e.g. user is on highest plan)
  if (upgradePlans.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-3xl px-4 pb-6 bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>

        {/* Upgrade Options */}
        <div className="space-y-4 mt-4">
          <p className="text-sm text-gray-700">
            You are currently on the{" "}
            <span className="font-semibold capitalize">{currentPlanId}</span>{" "}
            plan. Select one of the higher-tier plans below to upgrade.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {upgradePlans.map((plan) => (
              <div
                key={plan.id}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => void createUpgradeClientSecret(plan)}
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {plan.title}
                </h3>
                <p className="text-2xl font-extrabold text-gray-900 mt-2">
                  {plan.price}
                </p>
                <Button
                  className="mt-4 w-full"
                  disabled={isFetchingSecret}
                  variant="default"
                >
                  {isFetchingSecret ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Dialog to select saved cards or add a new card */}
        <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
          <DialogContent className="max-w-full sm:max-w-2xl rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Choose Payment Method
              </DialogTitle>
            </DialogHeader>

            {isFetchingSecret ? (
              <Skeleton className="h-8 w-full mt-4 rounded" />
            ) : (
              <div className="mt-4 space-y-6">
                {/* Saved Cards */}
                {savedCards.length > 0 && (
                  <div className="space-y-4">
                    {savedCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => setSelectedCard(card.id)}
                        className={`flex items-center justify-between border p-3 rounded cursor-pointer ${
                          selectedCard === card.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <p className="text-sm text-gray-800">
                            {card.brand.toUpperCase()} •••• {card.last4}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires {String(card.exp_month).padStart(2, "0")}/
                            {card.exp_year}
                          </p>
                        </div>
                        {selectedCard === card.id && (
                          <span className="text-xs text-blue-500 font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                    ))}
                    <Button
                      onClick={() => void upgradeSubscription()}
                      className="w-full mt-3"
                    >
                      Confirm Upgrade with Saved Card
                    </Button>
                  </div>
                )}

                {/* If no cards or user wants to add a new card */}
                <Button
                  variant="outline"
                  onClick={handleOpenPaymentForm}
                  className="w-full"
                >
                  Use a Different Card
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Form Dialog (similar to your existing FrequentPaymentForm) */}
        <Dialog open={openPaymentForm} onOpenChange={setOpenPaymentForm}>
          <DialogContent className="[&>button]:hidden max-w-lg">
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <FrequentPaymentForm
                  clientSecret={clientSecret}
                  userID={user.customData.userID}
                  subscription={subscription}
                  plan={"(UPGRADE)"} // Not mandatory, but you can pass the plan ID
                  priceId={""} // your new priceId if needed
                  subscriptionID={subscriptionId}
                  onSuccess={() => {
                    console.log("Payment success. Upgrading plan...");
                    void user.refreshCustomData();
                    void fetchContactsData(
                      user.customData.userID,
                      user.customData.email
                    ).then((res) => {
                      if (res) setCustomData(res.result);
                    });
                    handleCloseAll();
                  }}
                  onError={(err) => console.error("Payment error:", err)}
                  customerId={user.customData.customer_id}
                  intentType="upgrade"
                  close={handleCloseAll}
                />
              </Elements>
            )}
          </DialogContent>
        </Dialog>

        <DialogFooter className="mt-8">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionUpgradeDialog;
