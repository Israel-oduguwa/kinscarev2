/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

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
import { toast as shadToast } from "@/components/ui/use-toast";
import { toast } from "sonner"; // Import Sonner
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
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY || "");

function ProviderDialog({ candidate, similar, detailsPage }: any) {
  const authData = useAuthContext();
  const { userData, contactData, refreshData } = authData;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>("monthly");
  const [openInformation, setOpenInformation] = useState(false);
  const { privateApi } = useApiClient();
  const [message, setMessage] = useState(
    `Hi ${candidate.name}, we think you're a great fit for our opening, and we would love to talk to you!`
  );
  const [isTrialExpired, setIsTrialExpired] = useState(
    !(contactData.trial || contactData.subscribed)
  );
  const [isSending, setIsSending] = useState(false);
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

  // Trial period & subscription state
  useEffect(() => {
    try {
      const trialStart = contactData.trial_start_date;
      const trialEnd = contactData.trial_end_date;
      const isSubscribed = contactData.subscribed;
      if (isSubscribed) {
        setIsTrialExpired(false);
        return;
      }
      if (trialStart && trialEnd) {
        const trialActive = isTrialActive(trialStart, trialEnd);
        setIsTrialExpired(!trialActive);
      } else {
        const trialFlag = contactData.trial || false;
        setIsTrialExpired(!trialFlag);
      }
    } catch (err) {
      toast.error("Failed to determine trial/subscription state.");
      setIsTrialExpired(true);
    }
  }, [contactData]);

  // Check if candidate is already a favorite
  useEffect(() => {
    if (userData?.saved_candidates) {
      const isFav = userData.saved_candidates.some(
        (favorite: any) => favorite.userID === candidate.userID
      );
      setIsFavorite(isFav);
    }
  }, [userData, candidate.userID]);

  // Handles dialog open/close
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  // Prevent event bubbling
  const stopPropagation = (e: any) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  // Toggle Favorite Mutation
  const { mutate: toggleFavoriteCaregiver, isPending: isTogglingFavorite } =
    useMutation({
      mutationFn: async () => {
        const payload = {
          hash: userData?.hash,
          location: candidate.city,
          distinct_id: contactData.hash,
          userID: candidate.userID,
          geocode_address: candidate?.geocode_address?.coordinates,
          date_time: new Date().toISOString(),
          fname: `${candidate.fname}`,
          lname: `${candidate.lname}`,
          licenses: candidate.licenses,
          availability: candidate.availability,
          type: isFavorite ? "remove" : "add",
        };
        const { data } = await privateApi.post(
          "/api/v1/providers/set_favorites",
          payload
        );
        return data;
      },
      onSuccess: async () => {
        setIsFavorite((prev) => !prev);
        try {
          // refresh the data 
          refreshData()
          toast.success(
            isFavorite
              ? `Removed ${candidate.name} from Favorites`
              : `Added ${candidate.name} to Favorites`
          );
        } catch (err) {
          toast.error("Could not refresh user favorites list!");
        }
      },
      onError: (err) => {
        toast.error(
          `Failed to ${isFavorite ? "remove from" : "add to"} favorites.`
        );
        console.error(err);
      },
    });

  // Sends SMS message to candidate
  const sendMessage = async () => {
    
    setIsSending(true);
    try {
      // Send SMS
      const sms_payload = {
        body: message,
        to: candidate.settings.tel,
        country: "US",
      };
      const sendMessageResp = await privateApi.post(
        "/api/v1/twilio/sms/send",
        sms_payload
        // {
        //   headers: { Authorization: `Bearer ${token}` },
        // }
      );
      toast.success(`Message sent to ${candidate.fname} ${candidate.lname}!`);

      // If not subscribed, prompt upgrade info
      if (!contactData.subscribed || !contactData.trial) {
        closeDialog();
        setOpenInformation(true);
      } else {
        closeDialog();
        // Send notification to caregiver
        await privateApi.post(
          "/api/v1/notifications/send",
          {
            type: "message_caregiver",
            fromUserId: userData.userID,
            toUserId: candidate.userID,
            senderType: "caregiver",
            message: `"You have a new message from ${userData.fname} ${userData.lname}`,
            metadata: {
              caregiverEmail: candidate.settings.email,
              providerEmail: userData.settings.email,
              providerFullName: `${userData.fname} ${userData.lname}`,
              providerName: userData.name,
              caregiverName: candidate.name,
            },
          }
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to send the message. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  // Saved Cards logic (Stripe payment, not shown in dialog here)
  const closePaymentDialog = () => setPaymentDialogOpen(false);

  // Set default card visually (Stripe)
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
  // Utility for getting price ID by plan (Stripe, not shown in UI)
  const getPriceIdByPlan = (plan: "daily" | "weekly" | "monthly"): string => {
    const priceIds = {
      daily: "price_1QSCmtAoahxG9SLG2kga6E01",
      weekly: "price_1SG0IIAoahxG9SLGW3iCYQpb",
      monthly: "price_1QP2OuAoahxG9SLGNoc37Lxo",
    };
    if (!priceIds[plan]) {
      toast.error("Invalid plan selected.");
      throw new Error(
        "Invalid plan selected. Please choose daily, weekly, or monthly."
      );
    }
    return priceIds[plan];
  };

  // Create a new subscription (Stripe, not shown in UI)
  const createSubscription = async () => {
    if (!selectedCard) {
      toast.error("No card selected.");
      return;
    }
    const customerId = contactData.customer_id;
    const priceId = getPriceIdByPlan(selectedPlan);

    try {
      setLoading(true);
      const payload = {
        customerId,
        priceId,
        paymentMethodId: selectedCard,
      };
      const response = await privateApi.post(
        "/api/v1/providers/subscription",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.success) {
        const subscription = response.data.subscription;
        // Update MongoDB user doc
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
                subscription.start_date * 1000
              ).toISOString(),
              subscription_status: subscription.status,
              plan_id: subscription.plan.id,
              payment_verified: true,
            },
          },
        };
        const crudResponse = await privateApi.post(
          "/api/v1/auth/crud-operation",
          updatePayload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if (crudResponse.data.success) {
          router.refresh();
          setIsDialogOpen(false);
          toast.success("Subscription created and saved!");
        } else {
          toast.error("Failed to update user subscription in the database.");
        }
      } else {
        throw new Error(
          response.data.message || "Failed to create subscription."
        );
      }
    } catch (error: any) {
      toast.error(error?.message || "Subscription failed!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved cards (Stripe) when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchSavedCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen]);

  const fetchSavedCards = async () => {
    try {
      const customerId = contactData.customer_id;
      const response = await privateApi.post(
        `/api/v1/providers/payment-methods`,
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
        if (cards.length > 0) {
          setSelectedCard(cards[0].id);
        }
      } else {
        toast.error(
          response.data.message || "Failed to fetch saved payment methods."
        );
      }
    } catch (error: any) {
      // toast.error(error?.message || "Error fetching saved cards.");
    }
  };

  return (
    <div>
      <div className="flex space-x-2">
        {/* <Button onClick={refreshT}>Refresh Token</Button> */}
        <Button
          onClick={(e) => {
            stopPropagation(e);
            e.nativeEvent.preventDefault();
            openDialog();
          }}
          className="w-full lg:w-auto"
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
      {/* Main Dialog for Messaging */}
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
                {candidate.name}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Mail size={16} />
                <p className="text-sm font-medium text-gray-700">
                  Send a message to {candidate.name}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label
              htmlFor="message"
              className="block text-xs font-semibold text-gray-700"
            >
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              disabled={!contactData.payment_verified}
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
      {/* Information Dialog after sending */}
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
          <div className="mt-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold ">
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