"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { rewardReferrer } from "@/lib/paymentUtils";
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

const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY ?? "";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

/* -------------------------------------------------------------------------- */
/*                             Main Component                                 */
/* -------------------------------------------------------------------------- */

function PricingPlan({ closePricingDialog }: PricingPlanProps) {
  const { userData, contactData, refreshData } = useAuthContext();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("daily");
  const [loading, setLoading] = useState(false);
  const [isFetchingSecret, setIsFetchingSecret] = useState(false);
  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [subscriptionID, setSubscriptionID] = useState<string>("");
  const [renewingPlan, setRenewingPlan] = useState<boolean>(false);
  const { privateApi } = useApiClient();

  const router = useRouter();

  const pricingPlans: PricingPlanItem[] = [
    {
      id: "daily",
      title: "Daily Plan",
      price: "$23.99",
      stripePriceId: "price_1SG0IIAoahxG9SLGjs1ME0zJ",
      description:
        "Perfect for short-term projects or temporary needs. Get access for 24 hours.",
      features: ["24-hour access", "Full feature set", "24/7 premium support"],
    },
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
      description:
        "Best value! Get 30 days of unlimited access to all features.",
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
        const response = await privateApi.post(
          "/api/v1/providers/create-subscription",
          {
            customerId: contactData.customer_id,
            customerEmail: contactData.email,
            priceId: stripePriceId,
          }
        );

        const userID = contactData.userID;
        const payload = {
          collectionName: "contacts",
          operation: "updateOne",
          filter: { userID, role: "provider" },
          update: {
            $set: {
              plan: planId,
            },
          },
        };

        const database_response = await privateApi.post(
          "/api/v1/auth/crud-operation",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        const { clientSecret, subscriptionId, subscription } = response.data;
        setSubscriptionID(subscriptionId);
        setSubscription(subscription);
        setClientSecret(clientSecret);
        localStorage.setItem("client_secret", clientSecret);

        setIsCardDialogOpen(true);
        void fetchSavedCards();
      } catch (error) {
        console.log(error);
        console.error("Error creating subscription client secret:", error);
      } finally {
        setIsFetchingSecret(false);
      }
    },
    [contactData.customer_id]
  );

  const createSubscriptionClientSecretRenew = useCallback(
    async (
      planId: string,
      stripePriceId: string,
      discountPercentage: string
    ) => {
      setIsFetchingSecret(true);
      setSelectedPlan(planId);

      try {
        const response = await privateApi.post(
          "/api/v1/providers/create-subscription",
          {
            customerId: contactData.customer_id,
            coupon: discountPercentage,
            customerEmail: contactData.email,
            priceId: stripePriceId,
          }
        );

        const userID = contactData.userID;
        const payload = {
          collectionName: "contacts",
          operation: "updateOne",
          filter: { userID, role: "provider" },
          update: {
            $set: {
              plan: planId,
            },
          },
        };

        const database_response = await privateApi.post(
          "/api/v1/auth/crud-operation",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        const { clientSecret, subscriptionId, subscription } = response.data;
        setSubscriptionID(subscriptionId);
        setSubscription(subscription);
        setClientSecret(clientSecret);
        localStorage.setItem("client_secret", clientSecret);
        void fetchSavedCards();
      } catch (error) {
        console.error("Error creating subscription client secret:", error);
      } finally {
        setIsFetchingSecret(false);
      }
    },
    [contactData.customer_id]
  );

  useEffect(() => {
    const handleExpiredMonthlyPlan = async () => {
      if (
        contactData.plan &&
        contactData.subscription_status === "expired" &&
        contactData.successful_payment_count == 1
      ) {
        setSelectedPlan("monthly"); // Automatically select monthly plan
        setRenewingPlan(true);

        const selectedPlan = pricingPlans.find((plan) => plan.id === "monthly");
        try {
          const response = await privateApi.post(
            "/api/v1/providers/create-subscription",
            {
              customerId: contactData.customer_id,
              customerEmail: contactData.email,
              priceId: selectedPlan?.stripePriceId, // Monthly price ID
            }
          );

          const { clientSecret, subscriptionId, subscription } = response.data;
          setSubscriptionID(subscriptionId);
          setSubscription(subscription);
          setClientSecret(clientSecret);
          localStorage.setItem("client_secret", clientSecret);

          // Open the payment dialog immediately
          // setIsCardDialogOpen(true);
          void fetchSavedCards();
        } catch (error) {
          console.error("Error handling expired monthly plan:", error);
        } finally {
          setRenewingPlan(false);
        }
      }
    };

    handleExpiredMonthlyPlan();
  }, [contactData.plan, contactData.subscription_status]);

  /**
   * Fetch saved cards from the backend API.
   */
  const fetchSavedCards = useCallback(async () => {
    try {
      const response = await privateApi.post(
        "/api/v1/providers/payment-methods",
        {
          customerId: contactData.customer_id,
        }
      );

      if (response.data.success) {
        const cards: CardItem[] = response.data.data.map((cardObj: any) => ({
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
  }, [contactData.customer_id]);

  /**
   * Create the actual subscription using a selected card.
   */
  const createSubscription = useCallback(async () => {
    if (!selectedCard || !currentPlan) return;
    const customerId = contactData.customer_id;

    setLoading(true);
    try {
      await privateApi.post(
        "/api/v1/providers/subscription",
        {
          customerId,
          priceId: currentPlan.stripePriceId,
          paymentMethodId: selectedCard,
          customerEmail: contactData.email,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // Refresh user data and custom data
      await refreshData();
      router.refresh();

      const fetchedData = await fetchContactsData(
        contactData.userID,
        contactData.email
      );
      if (fetchedData) {
        // send reward
        await rewardReferrer(contactData.userID, "subscription");
        setTimeout(() => {
          window.location.reload(); // Reload after the delay
          handleCloseDialog();
          setIsCardDialogOpen(false);
          setLoading(false);
        }, 4000); // 3-second delay
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      setLoading(false);
    } finally {
    }
  }, [selectedCard, currentPlan, router, contactData ]);

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
    <div className="pt-4">
      {/* Heading */}
      {contactData.plan && contactData.subscription_status === "expired" ? (
        <div className="mx-auto max-w-4xl py-2 space-y-10">
          {renewingPlan || isFetchingSecret ? ( // Show skeletons when loading
            <div className="space-y-6">
              {/* Skeleton for Title */}
              <Skeleton className="h-8 w-3/4 mx-auto rounded-lg" />

              {/* Skeleton for Plan Selection */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32 rounded-lg" />
                <div className="flex flex-wrap gap-2">
                  {pricingPlans.map((_, index) => (
                    <Skeleton key={index} className="h-8 w-28 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Skeleton for Saved Cards Section */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-48 rounded-lg" />
                <div className="space-y-3">
                  {[...Array(2)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Skeleton for Buttons */}
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                Choose a Payment Method
              </h3>

              {contactData.subscription_status === "expired" && (
                <div>
                  {contactData.plan === "daily" &&
                  contactData.successful_payment_count == 1 ? (
                    <div className="bg-yellow-100 text-yellow-800 text-sm p-4 rounded-lg">
                      {" "}
                      <p>
                        Renew now to get <b>20% off</b> on the Monthly Plan and{" "}
                        <b>15% off</b> on the Weekly Plan!. Click the plan
                        button below
                      </p>
                    </div>
                  ) : contactData.plan === "weekly" ? (
                    <div className="bg-yellow-100 text-yellow-800 text-sm p-4 rounded-lg">
                      <p>
                        Renew now to get <b>20% off</b> on the Monthly Plan!
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Plan Selection */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                  Switch Plan
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pricingPlans.map((plan) => {
                    // Determine if this plan has a discount
                    const discountPercentage: any =
                      contactData.plan === "daily" && plan.id === "weekly"
                        ? 15
                        : contactData.plan === "daily" && plan.id === "monthly"
                        ? 20
                        : contactData.plan === "weekly" && plan.id === "monthly"
                        ? 20
                        : null;

                    return (
                      <div key={plan.id} className="relative">
                        <Button
                          key={plan.id}
                          variant={
                            selectedPlan === plan.id ? "default" : "outline"
                          }
                          onClick={() =>
                            void createSubscriptionClientSecretRenew(
                              plan.id,
                              plan.stripePriceId,
                              discountPercentage // Pass discountPercentage for use in the API
                            )
                          }
                          className={`text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition ${
                            selectedPlan === plan.id
                              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                          }`}
                        >
                          {plan.title}
                        </Button>
                        {discountPercentage && (
                          <div className="absolute -top-5 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                            {discountPercentage}% OFF
                          </div>
                        )}
                      </div>
                    );
                  })}
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
          )}
        </div>
      ) : (
        <div className="mx-auto py-10 space-y-10">
          <div className="text-center space-y-1">
            <h2 className="text-3xl tracking-tight font-extrabold text-gray-700">
              Choose Your Subscription Plan
            </h2>
            <p className="text-gray-600">
              Please purchase a plan to continue using Kinscare to recruit
              caregivers
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() =>
                  void createSubscriptionClientSecret(
                    plan.id,
                    plan.stripePriceId
                  )
                }
                className={`relative shadow-lg rounded-[var(--radius)] overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-2 cursor-pointer ${
                  plan.id === "monthly"
                    ? "bg-[hsl(var(--accent))] scale-105 border-2 border-[hsl(var(--primary))] shadow-2xl" // Highlight Monthly Plan
                    : "bg-[hsl(var(--card))]"
                }`}
              >
                {/* Accent Bar */}
                <div
                  className={`h-2 ${
                    plan.id === "monthly"
                      ? "bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]"
                      : "bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"
                  }`}
                />

                {/* Plan Details */}
                <div className="p-8">
                  {/* Recommended Badge */}
                  {plan.id === "monthly" && (
                    <div className="absolute top-4 right-4 bg-[hsl(var(--primary))] text-[hsl(var(--card))] px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      Recommended
                    </div>
                  )}

                  <h3
                    className={`text-2xl font-bold "text-[hsl(var(--card-foreground))]`}
                  >
                    {plan.title}
                  </h3>
                  <p
                    className={`text-4xl font-extrabold mt-4 ${
                      plan.id === "monthly"
                        ? "text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--foreground))]"
                    }`}
                  >
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
        </div>
      )}

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
                      void createSubscriptionClientSecret(
                        plan.id,
                        plan.stripePriceId
                      )
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
                    <>
                      {/* When the user does not have a saved card, we show the user the form  */}
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        No saved cards available. Use a new card to proceed.
                      </p>
                      {clientSecret && (
                        <Elements
                          stripe={stripePromise}
                          options={{ clientSecret }}
                        >
                          <FrequentPaymentForm
                            clientSecret={clientSecret}
                            userID={contactData.userID}
                            subscription={subscription}
                            plan={currentPlan?.id}
                            priceId={currentPlan?.stripePriceId ?? ""}
                            subscriptionID={subscriptionID}
                            onSuccess={(result) =>
                              console.log("Payment success:")
                            }
                            onError={(error) =>
                              console.log("Payment error:", error)
                            }
                            customerId={""}
                            intentType={""}
                            close={handleCloseDialog}
                          />
                        </Elements>
                      )}
                    </>
                  )}
                  {/* <Button
                    onClick={handleOpenPaymentForm}
                    variant={savedCards.length === 0 ? "default" : "outline"}
                    className="w-full mt-4 px-6 py-3 text-sm bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] rounded-lg shadow hover:shadow-lg transition"
                  >
                    Use another card
                  </Button> */}
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
                userID={contactData.userID}
                subscription={subscription}
                plan={currentPlan?.id}
                priceId={currentPlan?.stripePriceId ?? ""}
                subscriptionID={subscriptionID}
                onSuccess={(result) => console.log("Payment success:")}
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
