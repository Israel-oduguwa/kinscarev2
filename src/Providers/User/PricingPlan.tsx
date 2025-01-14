"use client";

import React, { useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchContactsData } from "@/lib/utils";
import FrequentPaymentForm from "./FrequentPaymentForm";

/* -------------------------------------------------------------------------- */
/*                               Type Definitions                              */
/* -------------------------------------------------------------------------- */

interface PricingPlanItem {
  id: string;
  title: string;
  price: string;
  stripePriceId: string;
  description: string;
  features: string[];
}

interface CardItem {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
}

interface SubscriptionData {
  id?: string;
  // Extend as needed to match your subscription object structure
}

interface CreateSubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
  subscription: SubscriptionData;
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

interface PricingPlanProps {
  closePricingDialog: () => void;
}

interface UserContext {
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

/* -------------------------------------------------------------------------- */
/*                        Environment Variable (Safe)                         */
/* -------------------------------------------------------------------------- */

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? "";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

/* -------------------------------------------------------------------------- */
/*                             Main Component                                 */
/* -------------------------------------------------------------------------- */

function PricingPlan({ closePricingDialog }: PricingPlanProps) {
  const { user, customData, setCustomData } = useContext(MongoContext) as UserContext;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("daily");
  const [loading, setLoading] = useState(false);
  const [isFetchingSecret, setIsFetchingSecret] = useState(false);
  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionID, setSubscriptionID] = useState<string>("");

  const router = useRouter();

  const pricingPlans: PricingPlanItem[] = [
    {
      id: "daily",
      title: "Daily Plan",
      price: "$23.99",
      stripePriceId: "price_1QXcozAoahxG9SLGGelfYlKJ",
      description: "Perfect for short-term projects or temporary needs. Get access for 24 hours.",
      features: ["24-hour access", "Full feature set", "Priority support during active period"],
    },
    {
      id: "weekly",
      title: "Weekly Plan",
      price: "$63.99",
      stripePriceId: "price_1QSCneAoahxG9SLGCHhFdN4C",
      description: "Ideal for weekly usage. Enjoy full access for 7 days at a discounted rate.",
      features: ["7-day access", "Full feature set", "Priority email support"],
    },
    {
      id: "monthly",
      title: "Monthly Plan",
      price: "$93.99",
      stripePriceId: "price_1QXcpZAoahxG9SLGjWJp4KfP",
      description: "Best value! Get 30 days of unlimited access to all features.",
      features: ["30-day access", "Full feature set", "24/7 premium support"],
    },
  ];

  const currentPlan = pricingPlans.find((plan) => plan.id === selectedPlan);

  /**
   * Fetch a new subscription client secret for the selected plan.
   */
  const createSubscriptionClientSecret = useCallback(
    async (planId: string, stripePriceId: string) => {
      setIsFetchingSecret(true);
      setSelectedPlan(planId);

      try {
        const response = await axios.post<CreateSubscriptionResponse>(
          "https://api.kinscare.org/api/v1/providers/create-subscription",
          {
            customerId: user.customData.customer_id,
            priceId: stripePriceId,
          }
        );

        const { clientSecret, subscriptionId, subscription } = response.data;
        setSubscriptionID(subscriptionId);
        setSubscription(subscription);
        setClientSecret(clientSecret);
        localStorage.setItem("client_secret", clientSecret);

        setIsCardDialogOpen(true);
        void fetchSavedCards();
      } catch (error) {
        console.error("Error creating subscription client secret:", error);
      } finally {
        setIsFetchingSecret(false);
      }
    },
    [user.customData.customer_id]
  );

  /**
   * Fetch saved cards from the backend API.
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
        const cards: CardItem[] = response.data.data.map((cardObj) => ({
          id: cardObj.id,
          brand: cardObj.card.brand,
          last4: cardObj.card.last4,
          exp_month: cardObj.card.exp_month,
          exp_year: cardObj.card.exp_year,
          isDefault: cardObj.default,
        }));
        setSavedCards(cards);
        if (cards.length > 0) setSelectedCard(cards[0].id);
      }
    } catch (error) {
      console.error("Error fetching saved cards:", error);
    }
  }, [user.customData.customer_id]);

  /**
   * Create the actual subscription using a selected card.
   */
  const createSubscription = useCallback(async () => {
    if (!selectedCard || !currentPlan) return;
    const customerId = user.customData.customer_id;

    setLoading(true);
    try {
      await axios.post(
        "https://api.kinscare.org/api/v1/providers/subscription",
        {
          customerId,
          priceId: currentPlan.stripePriceId,
          paymentMethodId: selectedCard,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // Refresh user data and custom data
      await user.refreshCustomData();
      router.refresh();

      const fetchedData = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      if (fetchedData) {
        setCustomData(fetchedData.result);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
    } finally {
      handleCloseDialog();
      setIsCardDialogOpen(false);
      setLoading(false);
    }
  }, [selectedCard, currentPlan, router, setCustomData, user]);

  /**
   * Handler to open the new card payment form.
   */
  const handleOpenPaymentForm = () => setOpenPaymentForm(true);

  /**
   * Close all open dialogs.
   */
  const handleCloseDialog = () => {
    setIsCardDialogOpen(false);
    setOpenPaymentForm(false);
    closePricingDialog();
  };

  return (
    <div className="mx-auto py-10 space-y-10">
      {/* Heading */}
      <div className="text-center space-y-1">
        <h2 className="text-3xl tracking-tight font-extrabold text-gray-700">
          Choose Your Subscription Plan
        </h2>
        <p className="text-gray-600">
          Select the plan that suits your needs and get started with full access today.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() =>
              void createSubscriptionClientSecret(plan.id, plan.stripePriceId)
            }
            className="relative bg-[hsl(var(--card))] shadow-lg rounded-[var(--radius)] overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-2 cursor-pointer"
          >
            {/* Accent Bar */}
            <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] h-2" />

            {/* Plan Details */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-[hsl(var(--card-foreground))]">
                {plan.title}
              </h3>
              <p className="text-4xl font-extrabold text-[hsl(var(--foreground))] mt-4">
                {plan.price}
              </p>
              <p className="text-[hsl(var(--muted-foreground))] mt-4">
                {plan.description}
              </p>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-[hsl(var(--card-foreground))] space-x-2"
                  >
                    {/* Check icon */}
                    <svg
                      className="w-5 h-5 text-[hsl(var(--chart-2))]"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 17.414l-5.707-5.707 1.414-1.414L10 14.586l8.293-8.293 1.414 1.414z" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {/* Choose Plan Button */}
              <Button className="mt-6 w-full" disabled={isFetchingSecret}>
                {isFetchingSecret && selectedPlan === plan.id && (
                  <Loader2 className="animate-spin mr-2 inline-block" />
                )}
                Choose plan
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Saved Cards Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-auto rounded-lg p-4 sm:p-6 bg-[hsl(var(--background))] shadow-lg">
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Choose a Payment Method
            </h3>

            {/* Plan Selection */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                Switch Plan
              </h4>
              <div className="flex flex-wrap gap-2">
                {pricingPlans.map((plan) => (
                  <Button
                    key={plan.id}
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    onClick={() =>
                      void createSubscriptionClientSecret(plan.id, plan.stripePriceId)
                    }
                    className={`text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition ${
                      selectedPlan === plan.id
                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {plan.title}
                  </Button>
                ))}
              </div>
            </div>

            {/* Saved Cards Section */}
            <div className="space-y-6">
              {isFetchingSecret ? (
                <Skeleton className="h-8 w-full rounded-lg" />
              ) : (
                <>
                  {savedCards.length > 0 ? (
                    <div className="space-y-4">
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
                                Exp {String(card.exp_month).padStart(2, "0")}/{card.exp_year}
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
                      <Button
                        onClick={() => void createSubscription()}
                        disabled={loading}
                        className="w-full sm:w-auto mt-4 px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg shadow hover:shadow-lg transition"
                      >
                        {loading && <Loader2 className="animate-spin mr-2" />}
                        Pay using saved card
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      No saved cards available. Use a new card to proceed.
                    </p>
                  )}
                  <Button
                    onClick={handleOpenPaymentForm}
                    variant={savedCards.length === 0 ? "default" : "outline"}
                    className="w-full mt-4 px-6 py-3 text-sm bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] rounded-lg shadow hover:shadow-lg transition"
                  >
                    Use another card
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Form Dialog */}
      <Dialog open={openPaymentForm} onOpenChange={setOpenPaymentForm}>
        <DialogContent className="[&>button]:hidden">
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <FrequentPaymentForm
                clientSecret={clientSecret}
                userID={user.customData.userID}
                subscription={subscription}
                plan={currentPlan?.id}
                priceId={currentPlan?.stripePriceId ?? ""}
                subscriptionID={subscriptionID}
                onSuccess={(result) => console.log("Payment success:", result)}
                onError={(error) => console.log("Payment error:", error)}
                customerId={""}
                intentType={""}
                close={handleCloseDialog}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PricingPlan;

/* -------------------------------------------------------------------------- */
/*                           Card Image Component                             */
/* -------------------------------------------------------------------------- */

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
