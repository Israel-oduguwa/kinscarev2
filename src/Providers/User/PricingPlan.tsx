"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import {
  CheckCircle,
  CreditCard,
  DeleteIcon,
  Loader2,
  Trash2Icon,
} from "lucide-react";
import { useContext, useState } from "react";
import FrequentPaymentForm from "./FrequentPaymentForm";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchContactsData, fetchUserData } from "@/lib/utils";

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_TEST_KEY || "");

function PricingPlan() {
  const { user, userData, setUser }: any = useContext(MongoContext); // User from context
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("daily"); // Default plan is daily
  const [loading, setLoading] = useState(false); // Show a loader during client secret generation
  const [isFetchingSecrete, setIsFetchingSecrete] = useState<boolean>(false);
  const [openPaymentForm, setOpenPaymentForm] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionID, setSubscriptionID] = useState<string>("");

  // Pricing plans with details
  const pricingPlans = [
    {
      id: "daily",
      title: "Daily Plan",
      price: "$23.99",
      stripePriceId: "price_1QXcozAoahxG9SLGGelfYlKJ",
      description:
        "Perfect for short-term projects or temporary needs. Get access for 24 hours.",
      features: [
        "24-hour access",
        "Full feature set",
        "Priority support during active period",
      ],
    },
    {
      id: "weekly",
      title: "Weekly Plan",
      price: "$63.99",
      stripePriceId: "price_1QSCneAoahxG9SLGCHhFdN4C",
      description:
        "Ideal for weekly usage. Enjoy full access for 7 days at a discounted rate.",
      features: ["7-day access", "Full feature set", "Priority email support"],
    },
    {
      id: "monthly",
      title: "Monthly Plan",
      price: "$93.99",
      stripePriceId: "price_1QXcpZAoahxG9SLGjWJp4KfP",
      description:
        "Best value! Get 30 days of unlimited access to all features.",
      features: ["30-day access", "Full feature set", "24/7 premium support"],
    },
  ];

  const currentPlan = pricingPlans.find((plan) => plan.id === selectedPlan);

  // Create subscription and generate client secret
  const createSubscriptionClientSecrete = async (
    plan: string,
    stripePriceId: string
  ) => {
    setIsFetchingSecrete(true);
    setSelectedPlan(plan);
    try {
      const response = await axios.post(
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
      fetchSavedCards();
    } catch (error: any) {
    } finally {
      setIsFetchingSecrete(false);
    }
  };

  // Fetch saved cards
  const fetchSavedCards = async () => {
    try {
      const response = await axios.post(
        "https://api.kinscare.org/api/v1/providers/payment-methods",
        {
          customerId: user.customData.customer_id,
        }
      );

      if (response.data.success) {
        const cards = response.data.data.map((card: any) => ({
          id: card.id,
          brand: card.card.brand,
          last4: card.card.last4,
          exp_month: card.card.exp_month,
          exp_year: card.card.exp_year,
          isDefault: card.default,
        }));
        setSavedCards(cards);
        if (cards.length > 0) setSelectedCard(cards[0].id); // Default to first card
      }
    } catch (error: any) {}
  };

  const createSubscription = async () => {
    if (!selectedCard) {
      return;
    }

    const customerId = user.customData.customer_id;
    try {
      setLoading(true);
      const payload = {
        customerId,
        priceId: currentPlan?.stripePriceId,
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
        // toast.success("Subscription created successfully.");
        const subscription = response.data.subscription;

        const updatePayload = {
          collectionName: "contacts",
          operation: "updateOne",
          filter: { userID: userData.userID, role: "provider" },
          update: {
            $set: {
              subscription_id: subscription.id,
              subscribed: true,
              trial: "expired",
              subscription_start_date: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              subscription_end_date: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              subscription_status: subscription.status,
              plan_id: subscription.plan.id,
              plan: currentPlan?.id,
              payment_verified: true,
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
        if (crudResponse.data.success) {
          user.refreshCustomData();
          handleCloseDialog();
          setIsCardDialogOpen(false);
          setOpenPaymentForm(false);
        } else {
        }
      } else {
        throw new Error(
          response.data.message || "Failed to create subscription."
        );
      }
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentForm = () => {
    setOpenPaymentForm(true);
  };

  const handleCloseDialog = () => {
    setIsCardDialogOpen(false);
    setOpenPaymentForm(false);
  };

  return (
    <div className="mx-auto py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Choose Your Subscription Plan
        </h2>
        <p className="text-gray-600">
          Select the plan that suits your needs and get started with full access
          today.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className="shadow-lg border rounded-lg p-6 hover:shadow-xl transition cursor-pointer"
            onClick={() =>
              createSubscriptionClientSecrete(plan.id, plan.stripePriceId)
            }
          >
            <h3 className="text-xl font-bold text-gray-900">{plan.title}</h3>
            <p className="text-4xl font-extrabold text-blue-600 mt-2">
              {plan.price}
            </p>
            <p className="text-gray-600 min-h-16 mt-4">{plan.description}</p>
            <ul className="mt-4 min-h-32 mb-4 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button disabled={isFetchingSecrete}>
              {isFetchingSecrete && selectedPlan === plan.id && (
                <Loader2 className="animate-spin" />
              )}{" "}
              Choose plan
            </Button>
          </div>
        ))}
      </div>

      {/* Saved Cards Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-2xl">
          <div className="p-6">
            <h3 className="text-xl tracking-tight font-bold mb-4">
              Choose a Payment Method
            </h3>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700">
                Switch Plan
              </h4>
              <div className="flex space-x-2 mt-2">
                {pricingPlans.map((plan) => (
                  <Button
                    key={plan.id}
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    onClick={() =>
                      createSubscriptionClientSecrete(
                        plan.id,
                        plan.stripePriceId
                      )
                    }
                  >
                    {plan.title}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid-cols-none gap-4">
              <div className="col-span-7">
                <div className="flex flex-col space-y-10">
                  {isFetchingSecrete ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <>
                      {savedCards.length > 0 ? (
                        <div className="space-y-4">
                          {savedCards.map((card) => (
                            <div
                              key={card.id}
                              onClick={() => setSelectedCard(card.id)}
                              className={`flex relative items-center py-4 px-4 rounded-lg cursor-pointer ${
                                selectedCard === card.id
                                  ? "border-gray-400 border"
                                  : "border-gray-300"
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="">
                                  <CardImage cardBrand={card.brand} />
                                </div>
                                <div>
                                  <p className="font-medium tracking-tight antialiased">
                                    Use {card.brand} card ending in {card.last4}
                                  </p>
                                  <p className="text-xs font-medium text-gray-500">
                                    Exp{" "}
                                    {String(card.exp_month).padStart(2, "0")}/
                                    {card.exp_year}
                                  </p>
                                </div>
                              </div>
                              {selectedCard === card.id && (
                                <div className="rounded-md absolute right-12 bg-slate-800 py-0.5 px-2.5 border border-transparent text-sm text-white transition-all shadow-sm">
                                  Default
                                </div>
                              )}
                              {/* <Trash2Icon
                                
                                className={`w-5 h-5 ml-auto ${
                                  selectedCard === card.id
                                    ? "text-gray-600"
                                    : "text-gray-300"
                                }`}
                              /> */}
                            </div>
                          ))}
                          <Button
                            onClick={createSubscription}
                            disabled={loading}
                          >
                            {loading && (
                              <Loader2 className="animate-spin mr-2" />
                            )}{" "}
                            Pay
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No saved cards available. Use a new card to proceed.
                        </p>
                      )}
                      {/* Use New Card */}
                      <Button onClick={handleOpenPaymentForm}>
                        Use another card
                      </Button>
                    </>
                  )}
                </div>
              </div>
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
                userID={userData.userID}
                subscription={subscription}
                plan={currentPlan?.id}
                priceId={currentPlan?.stripePriceId || ""}
                subscriptionID={subscriptionID}
                onSuccess={(result) => console.log(result)}
                onError={(error) => console.log(error)}
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

const CardImage = ({ cardBrand }: { cardBrand: string }) => {
  switch (cardBrand) {
    case "visa":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/e0b4cdc54800b9d7abcb9c012990662978eb39d4.png"
          width="35"
          height="20"
          alt="Visa"
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
          alt="amex"
        />
      );
    case "jcb":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/7973b75eccf5f9bd39414dff7d8a734d072f9d05.png"
          width="40"
          height="25"
          alt="Jcb"
        />
      );
    case "unionpay":
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/2a3f776d378871b45bb428034aad481a13adeb49.png"
          width="40"
          height="25"
          alt="Merchant Equipment Store Credit Card Logos"
        />
      );
    default:
      return (
        <img
          src="https://app.card-logo.com/uploads/thumbnail/128px/e0b4cdc54800b9d7abcb9c012990662978eb39d4.png"
          width="40"
          height="25"
          alt="Merchant Equipment Store Credit Card Logos"
        />
      );
  }
};
