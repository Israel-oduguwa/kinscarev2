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
import { Cloudy, CreditCard, FileText, Loader, X } from "lucide-react";
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
        "https://api.kinscare.org/api/v1/upload-file",
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
        "https://api.kinscare.org/api/v1/upload-file",
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
          "https://api.kinscare.org/api/v1/delete-file",
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
          "https://api.kinscare.org/api/v1/delete-file",
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
        "https://api.kinscare.org/api/v1/providers/create-setup-intent",
        {
          customerId: user?.customData?.customer_id,
        }
      );
      const { clientSecret } = response.data;
      localStorage.setItem("client_secret", clientSecret);
      setClientSecret(clientSecret);
      console.log(clientSecret)

      const isNotVerified = !(
        customData?.trial === true || customData?.subscribe === true
      );
      if (isNotVerified) {
        setIsTrialDialogOpen(true);
      }
    } catch (error) {
      console.log("Error fetching Setup Intent:", error);
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
        "https://api.kinscare.org/api/v1/auth/crud-operation",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(setReveal, "setReveal");
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
    console.log(isSubscribed, "ProtectedCandidatesDetails");
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
      console.log(trialFlag);
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
        "https://api.kinscare.org/api/v1/providers/payment-methods",
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
          "https://api.kinscare.org/api/v1/auth/crud-operation",
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
          className="h-[100vh] md:h-auto max-w-4xl overflow-y-auto"
        >
          <DialogHeader className="pt-5">
            <DialogTitle className="flex flex-col items-center text-center">
              <h2 className="font-bold tracking-tight mb-1 text-2xl text-gray-800">
                {currentStep === "selection" && "Get Verified & Connect To More Caregivers"}
                {currentStep === "payment" &&
                  "Get Verified with Payment Method"}
                {currentStep === "attestation" &&
                  "Upload a Signed Attestation Letter & Government-Issued ID"}
              </h2>
              {currentStep === "selection" && (
                <p className="text-gray-700">
                  To protect our caregivers and ensure a safe platform, verify
                  your identity with one of these options
                </p>
              )}
            </DialogTitle>
          </DialogHeader>

          {currentStep === "selection" && (
            <div className="space-y-6">
              <div className="space-y-4 text-gray-800">
                <div className="space">
                  <p className="text-md">
                    <span className="font-bold">
                      1. Verify Identity with Payment Details
                    </span>{" "}
                    <span className="italic">
                      (preferred by most employers)
                    </span>
                  </p>
                  <p className="text-sm">
                    Fast, secure, and FREE. Fill the form below for an instant,{" "}
                    <span className="font-bold">one-time verification</span>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {clientSecret && userData ? (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance }}
                  >
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
                  </Elements>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
              <OrSeparator />
              <h3 className="font-bold text-gray-800">
                2. Verify Identity with Signed Attestation Letter &
                Government-Issued ID
              </h3>
              <div
                className="flex items-center p-4 border shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition"
                onClick={() => setCurrentStep("attestation")}
              >
                <FileText className="w-10 h-10 text-blue-500 mr-4" />
                <div>
                  <p className="text-sm text-gray-600">
                    Download and print a signable attestation letter, then
                    upload it along with a government-issued ID that includes
                    your address. This option is more time-consuming.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === "attestation" && (
            <>
              <div className="space-y-4 text-gray-600">
                <p className="text-sm">
                  Download and print an attestation letter, sign it, and upload
                  it along with a government-issued ID containing your address.
                </p>
              </div>
              <div className="mt-4">
                <p className="font-semibold tracking-tight antialiased">
                  Attestation letter
                </p>
                {attestationPreview ? (
                  <div className="relative">
                    <iframe
                      src={attestationPreview}
                      className="w-full h-[200px]"
                    />
                    <Button
                      onClick={() => deleteFile(attestationPreview)}
                      className="absolute -top-4 right-0 bg-gray-800 text-white rounded-full"
                      size="icon"
                      variant="ghost"
                    >
                      <X
                        className={`${documentLoading && "animate-spin"}`}
                        size={20}
                      />
                    </Button>
                  </div>
                ) : (
                  <Dropzone
                    onDrop={(acceptedFiles: any) => {
                      handleDocumentUpload(acceptedFiles);
                    }}
                    disabled={documentLoading}
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc", ".docx"],
                    }}
                    maxSize={3145728}
                  >
                    {({ getRootProps, getInputProps }: any) => (
                      <div
                        {...getRootProps()}
                        className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer"
                      >
                        {documentLoading ? (
                          <Loader className="animate-spin" />
                        ) : (
                          <>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                              <Cloudy />
                              <p className="text-xs font-bold antialiased">
                                Drag and drop your attestation letter (PDF/DOCX)
                                here or click to select
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Dropzone>
                )}
              </div>
              {/* <div className="mt-4">
                <p className="font-semibold tracking-tight antialiased">
                  Government issued ID
                </p>
                {governmentID ? (
                  <div className="relative">
                    <iframe src={governmentID} className="w-full h-[200px]" />
                    <Button
                      onClick={() => deleteFile("government")}
                      className="absolute -top-4 right-0 bg-gray-800 text-white rounded-full"
                      size="icon"
                      variant="ghost"
                    >
                      <X
                        className={`${documentLoading && "animate-spin"}`}
                        size={20}
                      />
                    </Button>
                  </div>
                ) : (
                  <Dropzone
                    onDrop={(acceptedFiles: any) => {
                      handleGovernmentID(acceptedFiles);
                    }}
                    disabled={documentLoading}
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc", ".docx"],
                    }}
                    maxSize={3145728}
                  >
                    {({ getRootProps, getInputProps }: any) => (
                      <div
                        {...getRootProps()}
                        className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer"
                      >
                        {documentLoading ? (
                          <Loader className="animate-spin" />
                        ) : (
                          <>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                              <Cloudy />
                              <p className="text-xs font-bold antialiased">
                                Drag and drop your government-issued ID
                                (PDF/DOCX) here or click to select
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Dropzone>
                )}
              </div> */}
              <div className="mt-4">
                <Button
                  onClick={downloadFile}
                  className="bg-blue-500 text-white"
                >
                  Download Attestation Letter
                </Button>
              </div>
              <Button
                disabled={submitting}
                onClick={submitDocument}
                className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                {submitting && <Loader className="mr-2 animate-spin" />}
                Submit Document
              </Button>
              <Button onClick={() => setCurrentStep("selection")}>
                Go Back
              </Button>
            </>
          )}
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
