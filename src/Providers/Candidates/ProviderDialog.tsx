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
  const { userData, user, setUserData, customData } = mongodb;
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
    !(customData.trial || customData.subscribed)
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
    const trialStart = customData.trial_start_date;
    const trialEnd = customData.trial_end_date;
    const isSubscribed = customData.subscribed;

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
      const trialFlag = customData.trial || false;
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
          distinct_id: customData.hash,
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
  console.log(customData);
  // Send Message Function
  const sendMessage = async () => {
    const trialStart = customData.trial_start_date;
    const trialEnd = customData.trial_end_date;
    setIsSending(true);
    try {
      const sms_payload = {
        body: message,
        to: "+2348108517789", // Replace with the caregiver's phone number
      };
      const sendMessage = await axios.post(
        "http://localhost:8081/api/v1/twilio/sms/send",
        sms_payload
      );

      // Show success toast
      toast({
        title: "Message Sent",
        description: `Your message to ${candidate.fname} ${candidate.lname} has been sent successfully!`,
      });
      console.log("closed Dialogs");
      // const isNotVerified = !(customData.subscribe === true
      // );
      if (!customData.subscribed || !customData.trial) {
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
