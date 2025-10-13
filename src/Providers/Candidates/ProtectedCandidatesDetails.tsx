/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { fetchContactsData, isTrialActive, trackEvents } from "@/lib/utils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  Cloudy,
  CreditCard,
  Download,
  FileText,
  Loader,
  Loader2,
  Lock,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import PaymentForm from "../User/PaymentForm";
import PricingPlan from "../User/PricingPlan";
import Dropzone from "react-dropzone";
import { Separator } from "@radix-ui/react-dropdown-menu";

/** Stripe setup */
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY || "");

/**
 * This component handles:
 *  - Hiding/obfuscating caregiver contact info unless certain conditions (trial, subscription, or verification) are met.
 *  - A 4-second wait the first and second times an employer clicks "Reveal Contacts" before showing the real info.
 *  - Displaying popups prompting identity verification on the 1st and 2nd reveal attempts.
 *  - Handling subscription/trial dialogs, uploading attestation letter & ID for verification, etc.
 */
function ProtectedCandidatesDetails({
  email,
  name,
  tel,
}: {
  email: string;
  tel: string;
  name: string;
}) {
  const { user, userData, customData, setCustomData }: any =
    useContext(MongoContext);

  /**
   * isTrialExpired determines if contact info is obfuscated.
   * If true -> show obfuscated info and "Reveal Contacts" button.
   * If false -> show real contact info.
   */
  const [isTrialExpired, setIsTrialExpired] = useState(
    !(customData?.trial || customData?.subscribed)
  );

  const router = useRouter();

  /** Payment setup-intent variables */
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>("monthly");

  /** For the "Verify Identity" trial dialog steps: selection/payment/attestation */
  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "selection" | "payment" | "attestation"
  >("selection");
  const [loading, setLoading] = useState(false);

  /** Payment & subscription info */
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
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  /** For the 4-second countdown approach (the user’s first or second reveal attempts) */
  const [countdown, setCountdown] = useState(0);
  const [showCountDownDialog, setShowCountDownDialog] = useState(false);
  const [showFirstRevealDialog, setShowFirstRevealDialog] = useState(false);
  const [showSecondRevealDialog, setShowSecondRevealDialog] = useState(false);

  /** Attestation letter + ID upload states */
  const [documentLoading, setDocumentLoading] = useState(false);
  const [attestationPreview, setAttestationPreview] = useState<string | null>(
    null
  );
  const [governmentID, setGovernmentID] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [downloadComplete, setDownloadComplete] = useState(false);

  /**
   * For the new first/second reveal logic.
   * If you store in DB (contacts collection) something like:
   *   first_reveal_done: boolean
   *   second_reveal_done: boolean
   */
  const firstRevealDone = customData?.first_reveal_done === true;
  const secondRevealDone = customData?.second_reveal_done === true;

  /** THEME for Stripe Elements */
  const appearance: any = { theme: "flat" };

  /**
   * NEW STATE: Attestation Confirmation Modal (shown right after user uploads docs)
   */
  const [showAttestationConfirmation, setShowAttestationConfirmation] =
    useState(false);

  /** ============== File/Document Upload Functions ============== */
  const handleDocumentUpload = async (file: File[]) => {
    try {
      setDocumentLoading(true);
      const formData = new FormData();
      formData.append("file", file[0]);
      const { data } = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/upload-file",
        formData
      );
      if (data.url) {
        setAttestationPreview(data.url);
        toast({
          title: "Document uploaded successfully!",
          description: "Your identity has been verified.",
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error uploading document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleGovernmentID = async (file: File[]) => {
    try {
      setDocumentLoading(true);
      const formData = new FormData();
      formData.append("file", file[0]);
      const { data } = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/upload-file",
        formData
      );
      if (data.url) {
        setGovernmentID(data.url);
        toast({
          title: "Document uploaded successfully!",
          description: "Your identity has been verified.",
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error uploading document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  const deleteFile = async (file: any) => {
    try {
      setDocumentLoading(true);
      if (file === "government") {
        if (!governmentID) return;
        const payload = { fileUrl: governmentID };
        const { data } = await axios.post(
          "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/delete-file",
          payload
        );
        if (data.success) {
          setGovernmentID(null);
          toast({ title: "File deleted successfully", variant: "default" });
        }
      } else {
        if (!attestationPreview) return;
        const payload = { fileUrl: attestationPreview };
        const { data } = await axios.post(
          "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/delete-file",
          payload
        );
        if (data.success) {
          setAttestationPreview(null);
          toast({ title: "File deleted successfully", variant: "default" });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error deleting file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  /** ============== Payment + Subscription Setup ============== */
  const getSecrete = async () => {
    try {
      const response = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/create-setup-intent",
        {
          customerId: user?.customData?.customer_id,
        }
      );
      const { clientSecret } = response.data;
      localStorage.setItem("client_secret", clientSecret);
      setClientSecret(clientSecret);
      // console.log(clientSecret);

      const isNotVerified = !(
        customData?.trial === true || customData?.subscribe === true
      );
      if (isNotVerified) {
        setIsTrialDialogOpen(true);
      }
    } catch (error) {
      // console.log("Error fetching Setup Intent:", error);
    }
  };

  /** ============== Reveal Contacts ============== */
  const openRevealContacts = async () => {
    // If the user has not done the first reveal
    if (!firstRevealDone) {
      setCountdown(1);
      setIsTrialExpired(false);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) return prev - 1;
          clearInterval(interval);
          // after countdown ends, re-hide them & show the first message
          setIsTrialExpired(true);
          setShowCountDownDialog(false);
          // Show the first dialog
          setShowFirstRevealDialog(true);
          // Mark first reveal done in DB
          updateRevealStatus("first_reveal_done");
          return 0;
        });
      }, 1000);
    }
    // If the user has done first but not second reveal
    else if (firstRevealDone && !secondRevealDone) {
      setCountdown(1);
      setIsTrialExpired(false);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) return prev - 1;
          clearInterval(interval);
          setIsTrialExpired(true);
          setShowCountDownDialog(false);
          setShowSecondRevealDialog(true);
          updateRevealStatus("second_reveal_done");
          return 0;
        });
      }, 1000);
    }
    // If the user has done 2 reveals, fallback to existing logic
    else {
      const trialStart = customData?.trial_start_date;
      const trialEnd = customData?.trial_end_date;
      const isSubscribed = customData?.subscribed;
      if ((trialStart && trialEnd) || customData.trial === "expired") {
        const trialActive = isTrialActive(trialStart, trialEnd);
        if (!trialActive) {
          // open the payment subscribe modal
          setIsDialogOpen(true);
        }
      } else {
        setIsTrialExpired(true);
        openVerifyIdentity();
        getSecrete();
      }
    }
  };

  /** ============== DB Update: first/second reveal done ============== */
  const updateRevealStatus = async (
    field: "first_reveal_done" | "second_reveal_done"
  ) => {
    if (!userData?.userID) return;
    try {
      const payload = {
        collectionName: "contacts",
        operation: "updateOne",
        filter: { userID: userData.userID, role: "provider" },
        update: {
          $set: {
            [field]: true,
          },
        },
      };
      const setReveal = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/crud-operation",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      // console.log(setReveal, "setReveal");
      setCustomData((prev: any) => ({ ...prev, [field]: true }));
    } catch (error) {
      console.error("Error updating reveal status:", error);
    }
  };

  /** If user clicks the "Verify Your Identity" button after first reveal */
  const openVerifyIdentity = async () => {
    await getSecrete();
    setShowCountDownDialog(false);
  };

  const closeRevealContacts = () => {
    setIsTrialDialogOpen(false);
  };

  /** ============== On Mount: Check Subscription/Trial ============== */
  useEffect(() => {
    const trialStart = customData?.trial_start_date;
    const trialEnd = customData?.trial_end_date;
    const isSubscribed = customData?.subscribed;
    // console.log(isSubscribed, "ProtectedCandidatesDetails");
    if (isSubscribed) {
      // console.log(isSubscribed)
      setIsTrialExpired(false);
      return;
    }
    if (trialStart && trialEnd) {
      const trialActive = isTrialActive(trialStart, trialEnd);
      setIsTrialExpired(!trialActive);
    } else {
      const trialFlag =
        customData?.trial === false || customData?.trial === "expired"
          ? false
          : true;
      // console.log(trialFlag);
      setIsTrialExpired(!trialFlag);
    }
    const fetchCustomDataAPI = async () => {
      if (!user?.customData?.userID || !user?.customData?.email) return;
      const fetchedData: any = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      if (fetchedData) {
        await setCustomData(fetchedData.result);
      }
    };
    fetchCustomDataAPI();
  }, [user]);

  /** ============== Payment Cards: If dialog opens, fetch saved cards ============== */
  useEffect(() => {
    if (isDialogOpen) {
      fetchSavedCards();
    }
  }, [isDialogOpen]);

  const fetchSavedCards = async () => {
    try {
      const customerId = user?.customData?.customer_id;
      if (!customerId) return;
      const response = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/payment-methods",
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
        console.error("Failed to fetch saved cards:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error fetching saved cards:", error.message);
    }
  };

  const closePricingDialog = () => {
    setIsDialogOpen(false);
  };

  /** ============== Obfuscation Helpers ============== */
  const obfuscateText = (text: string): string => {
    if (text.includes("@")) {
      const [localPart, domain] = text.split("@");
      if (localPart.length <= 2) return text;
      const obfuscatedLocalPart = `${localPart.slice(0, 3)}${"*".repeat(
        Math.max(localPart.length - 6, 0)
      )}${localPart.slice(-3)}`;
      return `${obfuscatedLocalPart}@${domain}`;
    }
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

  function formatPhoneNumberToDigitsWithPlus(phone: string): string {
    return phone.replace(/(?!^\+)\D/g, "");
  }

  const encryptedEmail = obfuscateText(email);
  const encryptedTel = obfuscateText(formatPhoneNumberToDigitsWithPlus(tel));

  /** ============== Payment success handler ============== */
  const handleOnSuccess = () => {
    toast({
      title: "Success",
      description: "Payment Details verified successfully",
      variant: "default",
    });
  };

  /** ============== Attestation Submission ============== */
  const submitDocument = async () => {
    if (attestationPreview) {
      try {
        setSubmitting(true);
        const userID = userData?.userID;
        const freeTrialEndDate = new Date();
        freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);

        const payload = {
          collectionName: "contacts",
          operation: "updateOne",
          filter: { userID, role: "provider" },
          update: {
            $set: {
              identity_verified: "pending",
              attestation_letter: attestationPreview,
              // government_Id: governmentID,
              trial: false,
              subscribed: false,
              // trial_start_date: new Date().toISOString(),
              // trial_end_date: freeTrialEndDate.toISOString(),
            },
          },
        };
        await axios.post(
          "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/crud-operation",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        const payloadEvent = {
          settings: userData?.settings,
          lname: userData?.lname,
          fname: userData?.fname,
          tel: userData?.auth?.tel,
          zipcode: userData?.zipcode,
          city: userData?.city,
          email: userData?.auth?.email,
        };
        trackEvents(
          user?.customData?.hash,
          "Upload Attestation Document",
          payloadEvent
        );

        // Close the main trial dialog
        setIsTrialDialogOpen(false);
        // Show the new confirmation modal
        setShowAttestationConfirmation(true);

        // Refresh user data, and set trial as active (no longer expired)
        await user.refreshCustomData();
        // setIsTrialExpired(false);
        setCurrentStep("selection");
      } catch (error) {
        console.log("Error saving attestation/ID docs:", error);
      } finally {
        setSubmitting(false);
      }
    } else {
      toast({
        title: "Error submitting",
        description:
          "Please download/print an attestation letter, sign it, and upload it along with a government ID.",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async () => {
    const fileUrl =
      "https://kinscare-storage.s3.us-east-1.amazonaws.com/Kinscare_assets/KinsCare_Provider_Verification_Form+(2).pdf";
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "Kinscare_Verification_Form.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Show the download indicator
      setDownloadComplete(true);
      // Hide the indicator after 3 seconds
      setTimeout(() => setDownloadComplete(false), 3000);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      <h2 className="text-sm font-semibold">Contacts Information</h2>
      <div className="space-y-2 mt-1">
        {isTrialExpired ? (
          <div className="space-y-3">
            <div className="space-y-2 max-w-sm">
              <p className="text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200">
                {encryptedEmail}
              </p>
              <p className="text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200">
                {encryptedTel}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-600">
              Click the **Reveal Contacts** button below to view {name}&apos;s
              email and phone number.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-w-sm">
            <p className="text-sm px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200">
              {email}
            </p>
            <p className="text-sm px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200">
              {tel}
            </p>
          </div>
        )}
        {isTrialExpired && (
          <Button
            size="sm"
            onClick={openRevealContacts}
            className="w-full md:w-auto px-6 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition duration-200"
          >
            Reveal Contacts
          </Button>
        )}
      </div>

      {/* ============== FIRST REVEAL DIALOG ============== */}
      <Dialog
        open={showFirstRevealDialog}
        onOpenChange={setShowFirstRevealDialog}
      >
        <DialogContent className="[&>button]:hidden">
          {/* Custom DialogHeader */}
          <DialogHeader className="flex flex-row items-start space-x-1">
            {/* Custom Close Button */}
            <DialogClose className="p-1 rounded-full hover:bg-muted focus:outline-none">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
            {/* Title */}
            <DialogTitle>Get Verified & Connect To More Caregivers</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4">
            Great! Now you’ve seen how easy it is to access caregivers’ phone
            numbers and emails to connect with them directly. To keep viewing
            contact details, verify your identity as an employer—just once. It’s
            fast, secure, and helps ensure a safe environment for all!
          </DialogDescription>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              className="w-full"
              onClick={() => {
                openVerifyIdentity();
                setShowFirstRevealDialog(false);
              }}
            >
              Verify Your Identity
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============== SECOND REVEAL DIALOG ============== */}

      {/* ============== SECOND REVEAL DIALOG ============== */}
      <Dialog
        open={showSecondRevealDialog}
        onOpenChange={setShowSecondRevealDialog}
      >
        <DialogContent closePosition="left">
          <DialogHeader className="pt-5">
            <DialogTitle>Verify Your Identity</DialogTitle>
            <DialogDescription className="py-4">
              Protecting our caregivers is our top priority. In the past,
              scammers have misused our registry, so we now require employers to
              complete a one-time identity verification. This step assures
              caregivers that your interest in hiring them is genuine and
              trustworthy.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              className="w-full"
              onClick={async () => {
                // Again, open identity verification if desired:
                await openVerifyIdentity();
                setShowSecondRevealDialog(false);
              }}
            >
              Verify your Identity
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============== PAYMENT/PRICING PLAN DIALOG ============== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={`${
            customData.plan && customData.subscription_status === "expired"
              ? "max-w-3xl" // Set max-w to xl when plan is expired
              : "max-w-6xl" // Default to 6xl for other scenarios
          } overflow-y-auto max-h-full mx-auto bg-gradient-to-b from-blue-50 via-white to-gray-50 rounded-lg shadow-2xl`}
        >
          <PricingPlan closePricingDialog={closePricingDialog} />
        </DialogContent>
      </Dialog>
      {/* ============== TRIAL VERIFICATION (ATT. LETTER / PAYMENT) DIALOG ============== */}
      <Dialog open={isTrialDialogOpen} onOpenChange={setIsTrialDialogOpen}>
        <DialogContent
          closePosition="left"
          className="max-w-4xl p-0 m-0 space-y-0 overflow-y-auto h-[90vh]"
        >
          <div className="px-6">
            <div className="relative pb-3  pt-6">
              <div className="absolute top-4 right-4 flex items-center">
                <BadgeCheck className="text-blue-500 mr-2" size={20} />
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  Secure Payment
                </span>
              </div>
              <DialogHeader>
                <div className="flex items-center justify-between mt-5">
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                    {currentStep === "selection" &&
                      "Get Verified & Connect To More Caregivers"}
                    {currentStep === "attestation" && "Document Verification"}
                    {currentStep === "selection" && (
                      <p className="text-gray-600 font-normal tracking-normal text-sm">
                        To protect our caregivers and ensure a safe platform,
                        verify your identity with one of these options
                      </p>
                    )}
                  </DialogTitle>
                </div>
              </DialogHeader>
            </div>
            {currentStep === "selection" && (
              <div className="space-y-6">
                <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 hidden md:block  rounded-lg mr-4">
                      <CreditCard className="text-blue-600" size={16} />
                    </div>
                    <div className="w-full">
                      <div className="flex items-center">
                        <h3 className="font-bold text-gray-800">
                          Instant Verification with Payment Method
                        </h3>
                        <span className="ml-2 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Fast, secure, and FREE. Fill the form below for an
                        instant, one-time verification
                      </p>

                      <div className="mt-4">
                        {clientSecret && userData ? (
                          <Elements
                            stripe={stripePromise}
                            options={{ clientSecret, appearance }}
                          >
                            <div className="bg-white p-4 rounded-lg border">
                              <PaymentForm
                                close={closeRevealContacts}
                                setIsTrialExpired={setIsTrialExpired}
                                clientSecret={clientSecret}
                                userID={userData.userID}
                                customerId={customData?.customer_id}
                                priceId="price_1QP2OuAoahxG9SLGNoc37Lxo"
                                intentType="setup"
                                onSuccess={() => {
                                  handleOnSuccess();
                                }}
                                onError={(error) => {
                                  console.error("Error saving card:", error);
                                }}
                              />
                            </div>
                          </Elements>
                        ) : (
                          <div className="flex justify-center py-8">
                            <Loader2
                              className="animate-spin text-blue-500"
                              size={24}
                            />
                            <span className="ml-2 text-gray-600">
                              Loading secure payment...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="mx-4 text-sm text-gray-500">OR</span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>

                <div
                  className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => setCurrentStep("attestation")}
                >
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-lg mr-4">
                      <FileText className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        Manual Verification with Documents
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Upload signed attestation letter and government ID. This
                        process may take 1-2 business days.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3 w-full font-semibold text-blue-700 border-blue-300 hover:bg-blue-50 transition"
                        onClick={() => setCurrentStep("attestation")}
                      >
                        Choose Manual Verification
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "attestation" && (
              <div className="space-y-6">
                <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-2">
                    Upload Required Documents
                  </h3>
                  <p className="text-sm text-gray-600">
                    To complete manual verification, please provide the
                    following documents
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                        1
                      </span>
                      <label className="font-medium text-gray-800">
                        Download Attestation Letter
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 ml-7 mb-3">
                      Fill out, sign, and upload the completed document
                    </p>
                    <Button
                      onClick={downloadFile}
                      className="inline-flex items-center justify-center ml-6 px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-violet-800 hover:-translate-y-1"
                    >
                      <Download className="mr-2" size={16} />
                      Download Attestation Letter
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                        2
                      </span>
                      <label className="font-medium text-gray-800">
                        Upload Signed Attestation
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 ml-7 mb-3">
                      PDF or DOCX format (max 3MB)
                    </p>
                    <div className="ml-7">
                      {attestationPreview ? (
                        <div className="relative bg-gray-50 rounded-lg border p-4">
                          <div className="flex items-center">
                            <FileText className="text-blue-500 mr-3" />
                            <span className="font-medium text-sm">
                              attestation-letter.pdf
                            </span>
                            <Button
                              onClick={() => deleteFile(attestationPreview)}
                              className="ml-auto"
                              variant="ghost"
                              size="icon"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Dropzone
                          onDrop={(acceptedFiles) =>
                            handleDocumentUpload(acceptedFiles)
                          }
                          disabled={documentLoading}
                          accept={{
                            "application/pdf": [".pdf"],
                            "application/msword": [".doc", ".docx"],
                          }}
                          maxSize={3145728}
                        >
                          {({ getRootProps, getInputProps }) => (
                            <div
                              {...getRootProps()}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-300 bg-gray-50 transition-colors"
                            >
                              {documentLoading ? (
                                <div className="flex flex-col items-center">
                                  <Loader2
                                    className="animate-spin text-blue-500 mb-2"
                                    size={24}
                                  />
                                  <p className="text-sm text-gray-600">
                                    Uploading document...
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <input {...getInputProps()} />
                                  <div className="flex flex-col items-center">
                                    <UploadCloud
                                      className="text-gray-400 mb-2"
                                      size={24}
                                    />
                                    <p className="font-medium text-gray-700">
                                      Drag & drop your file here
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      or click to browse
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      PDF, DOC, DOCX (max 3MB)
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </Dropzone>
                      )}
                    </div>
                  </div>

                  {/* Government ID section would go here if enabled */}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-full shadow hover:shadow-md transition-all duration-300 hover:bg-gray-50"
                    onClick={() => setCurrentStep("selection")}
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    Back to options
                  </Button>
                  <Button
                    disabled={!attestationPreview || submitting}
                    onClick={submitDocument}
                    className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-violet-800 hover:-translate-y-1"
                  >
                    {submitting && (
                      <Loader2 className="mr-2 animate-spin" size={16} />
                    )}
                    Submit Verification
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center text-sm text-gray-500">
              <Lock className="mr-2" size={14} />
              <span>Your information is securely encrypted</span>
              <div className="ml-auto flex space-x-4">
                <ShieldCheck className="text-green-500" size={16} />
                <BadgeCheck className="text-blue-500" size={16} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* ============== ATTESTATION CONFIRMATION MODAL ============== */}
      <Dialog
        open={showAttestationConfirmation}
        onOpenChange={setShowAttestationConfirmation}
      >
        <DialogContent closePosition="left" className="max-w-3xl">
          <DialogHeader className="pt-5">
            <DialogTitle className="text-lg font-semibold">
              Thank you for submitting your documents!
            </DialogTitle>
            <DialogDescription className="py-4">
              If you’d like to start connecting with caregivers immediately, you
              can verify instantly by adding a payment method. This option is
              secure, hassle-free, and ensures you can begin reaching out to
              caregivers without delay.
            </DialogDescription>
            <p className="text-sm">
              Fast, secure, and FREE. Fill the form below for an instant,{" "}
              <span className="font-bold">one-time verification</span>
            </p>
          </DialogHeader>
          <div className="mt-4">
            {/* PaymentForm for immediate verification */}
            {clientSecret && userData ? (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance }}
              >
                <PaymentForm
                  close={() => setShowAttestationConfirmation(false)}
                  setIsTrialExpired={setIsTrialExpired}
                  clientSecret={clientSecret}
                  userID={userData.userID}
                  customerId={customData?.customer_id}
                  priceId="price_1QP2OuAoahxG9SLGNoc37Lxo"
                  intentType="setup"
                  onSuccess={() => {
                    handleOnSuccess();
                    setShowAttestationConfirmation(false);
                  }}
                  onError={(error) => {
                    console.error("Error saving card:", error);
                  }}
                />
              </Elements>
            ) : (
              <p>Loading Payment Form...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProtectedCandidatesDetails;

// Thank you for submitting your attestation letter and
// government-issued ID. The verification process may take up to 2
// days, and we’ll contact you if anything needs clarification.
// <br />

const OrSeparator: React.FC = () => {
  return (
    <div className="w-full flex items-center gap-2 my-4">
      <div className="flex-grow border-t border-gray-300"></div>
      <p className="text-gray-900 font-normal antialiased text-md">or</p>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
};
