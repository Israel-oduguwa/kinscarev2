"use client";
import MongoContext from "@/app/MongoContext";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Elements } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  Bookmark,
  Mail,
  Send,
  Loader,
  CreditCard,
  CheckCircle,
  Trash,
  Loader2,
} from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import PaymentForm from "../User/PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { fetchUserData, isTrialActive } from "@/lib/utils";
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_TEST_KEY || "");

function ProviderDialog({ candidate, similar, detailsPage }: any) {
  const mongodb: any = useContext(MongoContext);
  const { userData, user, setUserData } = mongodb;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // Track if caregiver is favorite
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>("monthly");
  const [openInformation, setOpenInformation] = useState(false);
  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(false);
  const [message, setMessage] = useState(
    `Hi ${candidate.fname} ${candidate.lname}, we think you're a great fit for our opening, and we would love to talk to you!`
  );
  const [isTrialExpired, setIsTrialExpired] = useState(
    !(user?.customData?.trial || user?.customData?.subscribed)
  );
  const [isSending, setIsSending] = useState(false); // Track sending state
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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

  useEffect(() => {
    if (userData?.saved_candidates) {
      const isFav = userData.saved_candidates.some(
        (favorite: any) => favorite.userID === candidate.userID
      );

      // console.log(isFav, "sake");

      setIsFavorite(isFav);
    }
  }, [userData]);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const stopPropagation = (e: any) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };
  const closeTrialDialogBox = () => {
    setIsTrialDialogOpen(false);
  };

  // Toggle Favorite Mutation
  const { mutate: toggleFavoriteCaregiver, isPending: isTogglingFavorite } =
    useMutation({
      mutationFn: async () => {
        const payload = {
          hash: userData?.hash,
          location: candidate.city,
          distinct_id: user?.customData?.hash,
          userID: candidate.userID,
          geocode_address: candidate?.geocode_address?.coordinates,
          date_time: new Date().toISOString(),
          fname: `${candidate.fname}`,
          lname: `${candidate.lname}`,
          licenses: candidate.licenses,
          availability: candidate.availability,
          type: isFavorite ? "remove" : "add",
        };

        const { data } = await axios.post(
          "https://api.kinscare.org/api/v1/providers/set_favorites",
          payload
        );
        return data;
      },
      onSuccess: async () => {
        setIsFavorite((prev) => !prev);
        const fetchedData: any = await fetchUserData(
          user.customData.userID,
          user.customData.email
        );
        // console.log(fetchedData);
        setUserData(fetchedData.result);
        toast({
          title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
          description: `Caregiver ${candidate.fname} ${
            candidate.lname
          } has been ${
            isFavorite ? "removed from" : "added to"
          } your favorites.`,
        });
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          toast({
            title: "Error",
            description: `Failed to ${
              isFavorite ? "remove from" : "add to"
            } favorites. Please try again.`,
            variant: "destructive",
          });
        }
        console.error(err);
      },
    });

  // Send Message Function
  const sendMessage = async () => {
    const trialStart = user?.customData?.trial_start_date;
    const trialEnd = user?.customData?.trial_end_date;
    setIsSending(true);
    try {
      const sms_payload = {
        body: message,
        to: "+2348108517789", // Replace with the caregiver's phone number
      };
      const sendMessage = await axios.post(
        "https://api.kinscare.org/api/v1/twilio/sms/send",
        sms_payload
      );

      // Show success toast
      toast({
        title: "Message Sent",
        description: `Your message to ${candidate.fname} ${candidate.lname} has been sent successfully!`,
      });
      console.log("closed Dialogs");
      const isNotVerified = !(
        user?.customData?.trial === true || user?.customData?.subscribe === true
      );
      if (isNotVerified) {
        closeDialog();
        setOpenInformation(true);
        // setIsTrialDialogOpen(true);
      } else {
        closeDialog();
        // send the caregiver an email too  and push a notification
        // send the caregiver a notification
        await axios.post("https://api.kinscare.org/api/v1/notifications/send", {
          type: "message_caregiver", // provider sends message to the caregiver
          fromUserId: userData.userID, // the provider user id
          toUserId: candidate.userID, // the caregiver user id
          senderType: "caregiver", // the person sending the message role
          message: `"You have a new message from ${userData.name}`,
          metadata: {
            caregiverEmail: candidate.settings.email,
            providerEmail: userData.settings.email,
            providerFullName: `${userData.fname} ${userData.lname}`,
            providerName: userData.name,
            caregiverName: candidate.name,
          },
        });
      }

      // // Check the User trial and payment status
      // if (trialStart && trialEnd) {
      //   const trialActive = isTrialActive(trialStart, trialEnd);
      //   // open the payment subscribe modal
      //   // setPaymentDialogOpen(true);
      //   // setOpenInformation(true)
      // } else {
      //   // // lets generate the free trial client secrete and store to localStorage
      //   // const response = await axios.post(
      //   //   "https://api.kinscare.org/api/v1/providers/create-setup-intent",
      //   //   {
      //   //     customerId: user.customData.customer_id,
      //   //   }
      //   // );
      //   // console.log(response.data);
      //   // const { clientSecret } = response.data;
      //   // // Store the client secret in localStorage to persist across reloads
      //   // localStorage.setItem("client_secret", clientSecret);
      //   // setClientSecret(clientSecret);
      //   // // console.log(response)
      //   // // Close the dialog after sending
      //   console.log("closed Dialogs")
      //   closeDialog();
      //   const isNotVerified = !(
      //     user?.customData?.trial === true ||
      //     user?.customData?.subscribe === true
      //   );
      //   if (isNotVerified) {
      //     setOpenInformation(true)
      //     // setIsTrialDialogOpen(true);
      //   }
      // }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send the message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const closePaymentDialog = () => {
    setPaymentDialogOpen(false);
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

  const appearance: any = {
    theme: "flat",
  };
  return (
    <div>
      <div className="flex space-x-2">
        <Button
          onClick={(e) => {
            stopPropagation(e);
            e.nativeEvent.preventDefault();
            openDialog();
          }}
          className="w-full"
        >
          <span className="flex space-x-1 items-center gap-2">
            <Send size={16} /> Message{" "}
            {detailsPage ? candidate.name : "caregiver"}
          </span>
        </Button>
        {!similar && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => toggleFavoriteCaregiver()}
            disabled={isTogglingFavorite}
          >
            <Bookmark
              size={18}
              className={`${
                isFavorite ? "text-purple-700 fill-current" : "text-gray-600"
              }`}
              fill={isFavorite ? "currentColor" : "none"}
            />
          </Button>
        )}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="lg:max-w-2xl max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center justify-center text-center">
              <div className="mb-3">
                <ProfileAvatar
                  size="w-12 h-12"
                  name={`${candidate?.name}`}
                  profileImage={candidate?.profileImage}
                />
              </div>
              <p className="font-bold text-2xl text-gray-800">
                {candidate.fname} {candidate.lname}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Mail size={16} />
                <p className="text-sm font-medium text-gray-700">
                  Send a message to {candidate.fname}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            <label
              htmlFor="message"
              className="block text-xs font-semibold text-gray-700"
            >
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              disabled={!user.customData.payment_verified}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="block p-2.5 w-full text-sm focus-visible:outline-blue-500 text-gray-900 bg-gray-50 rounded-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            ></textarea>
          </div>
          <div className="w-full">
            <Button
              onClick={sendMessage}
              className="w-full"
              disabled={isSending}
            >
              {isSending ? (
                <Loader className="animate-spin w-5 h-5 mx-auto" />
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dialog Box Payment */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
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

      <Dialog open={isTrialDialogOpen} onOpenChange={setIsTrialDialogOpen}>
        <DialogContent className=" max-w-[720px] mx-auto p-6 bg-white rounded-lg shadow-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center text-center">
              <div className="mb-3">
                <CreditCard className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="font-bold text-2xl text-gray-800">
                Get Verified & Start Free Trial
              </h2>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-gray-600">
            <p className="text-sm">
              To protect caregivers and ensure trust, we require employers to
              add a billing address and payment method before viewing
              caregivers’ contact details. This is only done once.
            </p>
            <p className="text-sm">
              <span className="text-blue-600">
                {" "}
                No charges will be applied—
              </span>{" "}
              this step is only to verify your identity. It’s a common practice
              to prevent misuse, as some users in the past posed as providers to
              scam caregivers.
            </p>
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
                    console.log("Card saved successfully:", result);
                    alert("Card saved!");
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

      {/* Information  */}
      <Dialog open={openInformation} onOpenChange={setOpenInformation}>
        <DialogContent className="max-w-xl mx-auto p-6 rounded-lg shadow-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Message Sent to {candidate.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-2">
              Your message has been successfully delivered. While{" "}
              {candidate.name} may take some time to review and respond, you can
              take the next step now.
            </DialogDescription>
          </DialogHeader>

          {/* Call-to-Action */}
          <div className="mt-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold ">
                {" "}
                Need to connect with {candidate.name} directly?{" "}
              </span>
              Click the Reveal Contacts button below to access {candidate.name}
              's phone number and reach out immediately.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProviderDialog;
