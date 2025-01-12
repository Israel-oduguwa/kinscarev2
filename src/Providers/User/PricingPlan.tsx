"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchContactsData } from "@/lib/utils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import FrequentPaymentForm from "./FrequentPaymentForm";

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_TEST_KEY || "");

function PricingPlan({ closePricingDialog }: any) {
  const { user, customData, setCustomData }: any = useContext(MongoContext);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("daily");
  const [loading, setLoading] = useState(false);
  const [isFetchingSecret, setIsFetchingSecret] = useState<boolean>(false);
  const [openPaymentForm, setOpenPaymentForm] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionID, setSubscriptionID] = useState<string>("");
  const router = useRouter();

  const pricingPlans = [
    {
      id: "daily",
      title: "Daily Plan",
      price: "$23.99",
      stripePriceId: "price_1QXcozAoahxG9SLGGelfYlKJ",
      description: "Perfect for short-term projects or temporary needs. Get access for 24 hours.",
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

  const createSubscriptionClientSecret = async (
    plan: string,
    stripePriceId: string
  ) => {
    setIsFetchingSecret(true);
    setSelectedPlan(plan);
    try {
      console.log(JSON.stringify(user))
      const response = await axios.post(
        "https://api.kinscare.org/api/v1/providers/create-subscription",
        {
          customerId: user.customData.customer_id,
          customerEmail: user.customData.email,
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
    } catch (error) {
      console.error("Error creating subscription client secret:", error);
    } finally {
      setIsFetchingSecret(false);
    }
  };

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
        if (cards.length > 0) setSelectedCard(cards[0].id);
      }
    } catch (error) {
      console.error("Error fetching saved cards:", error);
    }
  };

  const createSubscription = async () => {
    if (!selectedCard) return;

    const customerId = user.customData.customer_id;
    try {
      setLoading(true);
      const payload = {
        customerId,
        priceId: currentPlan?.stripePriceId,
        paymentMethodId: selectedCard,
      };

      await axios.post(
        "https://api.kinscare.org/api/v1/providers/subscription",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      await user.refreshCustomData();
      router.refresh();

      const fetchedData: any = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      if (fetchedData) {
        await setCustomData(fetchedData.result);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
    } finally {
      handleCloseDialog();
      setIsCardDialogOpen(false);
      setLoading(false);
    }
  };

  const handleOpenPaymentForm = () => setOpenPaymentForm(true);

  const handleCloseDialog = () => {
    setIsCardDialogOpen(false);
    setOpenPaymentForm(false);
    closePricingDialog();
  };

  return (
    <div className="mx-auto py-10 space-y-10">
      <div className="text-center space-y-1">
        <h2 className="text-3xl tracking-tight font-extrabold text-gray-900">
          Choose Your Subscription Plan
        </h2>
        <p className="text-gray-600">
          Select the plan that suits your needs and get started with full access
          today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
        {pricingPlans.map((plan) => (
          <div
            onClick={() =>
              createSubscriptionClientSecret(plan.id, plan.stripePriceId)
            }
            key={plan.id}
            className="relative bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 w-full"></div>
            <div className="p-6">
              <h3 className="text-1xl font-extrabold text-gray-800">
                {plan.title}
              </h3>
              <p className="text-5xl font-bold text-blue-600 my-4">
                {plan.price}
              </p>
              <p className="text-gray-600 text-sm mb-6 min-h-16">
                {plan.description}
              </p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-gray-700 font-medium"
                  >
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 17.414l-5.707-5.707 1.414-1.414L10 14.586l8.293-8.293 1.414 1.414z" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" disabled={isFetchingSecret}>
                {isFetchingSecret && selectedPlan === plan.id && (
                  <Loader2 className="animate-spin" />
                )} Choose plan
              </Button>
            </div>
            <div className="absolute inset-0 ring-2 ring-transparent focus-visible:ring-blue-500"></div>
          </div>
        ))}
      </div>

      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-auto rounded-lg p-4 sm:p-6 bg-white shadow-lg">
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-gray-800">
              Choose a Payment Method
            </h3>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">
                Switch Plan
              </h4>
              <div className="flex flex-wrap gap-2">
                {pricingPlans.map((plan) => (
                  <Button
                    key={plan.id}
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    onClick={() =>
                      createSubscriptionClientSecret(plan.id, plan.stripePriceId)
                    }
                    className="text-sm px-4 py-2"
                  >
                    {plan.title}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {isFetchingSecret ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <>
                  {savedCards.length > 0 ? (
                    <div className="space-y-4">
                      {savedCards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCard(card.id)}
                          className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border ${
                            selectedCard === card.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300"
                          } transition-colors`}
                        >
                          <div className="flex items-center gap-4">
                            <CardImage cardBrand={card.brand} />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                Use {card.brand} card ending in {card.last4}
                              </p>
                              <p className="text-xs text-gray-500">
                                Exp {String(card.exp_month).padStart(2, "0")}/
                                {card.exp_year}
                              </p>
                            </div>
                          </div>
                          {selectedCard === card.id && (
                            <span className="text-sm text-blue-600 font-medium">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                      <Button
                        onClick={createSubscription}
                        disabled={loading}
                        className="w-full sm:w-auto mt-4 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        {loading && <Loader2 className="animate-spin mr-2" />}
                        Pay using saved card
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No saved cards available. Use a new card to proceed.
                    </p>
                  )}
                  <Button
                    onClick={handleOpenPaymentForm}
                    variant={savedCards.length === 0 ? "default" : "outline"}
                    className="w-full mt-4 px-6 py-3 text-sm rounded-lg"
                  >
                    Use another card
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openPaymentForm} onOpenChange={setOpenPaymentForm}>
        <DialogContent className="[&>button]:hidden">
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <FrequentPaymentForm
                clientSecret={clientSecret}
                userID={user.customData.userID}
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
