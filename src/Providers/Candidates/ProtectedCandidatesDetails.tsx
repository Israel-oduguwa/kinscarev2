/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import ProtectedCandidateDialogs from "./ProtectedCandidateDialogs";
import { toast as sonnerToast } from "sonner";
import { getChatAccess, trackEvents } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useApiClient } from "@/hooks/useApiClient";

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
  const {userData, refreshData, contactData} = useAuthContext()
 
  /**
   * isTrialExpired determines if contact info is obfuscated.
   * If true -> show obfuscated info and "Reveal Contacts" button.
   * If false -> show real contact info.
   */
  const [isTrialExpired, setIsTrialExpired] = useState(
    !getChatAccess(contactData).canChat
  );

  /** Payment setup-intent variables */
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {privateApi} = useApiClient();
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

  /**
   * For the new first/second reveal logic.
   * If you store in DB (contacts collection) something like:
   *   first_reveal_done: boolean
   *   second_reveal_done: boolean
   */
  const firstRevealDone = contactData?.first_reveal_done === true;
  const secondRevealDone = contactData?.second_reveal_done === true;
  // console.log(secondRevealDone, contactData)
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
      const { data } = await privateApi.post(
        "/api/v1/upload-file",
        formData
      );
      if (data.url) {
        setAttestationPreview(data.url);
        sonnerToast.success("Document uploaded successfully!");
      }
    } catch (error: any) {
      sonnerToast.error(error.message || "Error uploading document.");
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleGovernmentID = async (file: File[]) => {
    try {
      setDocumentLoading(true);
      const formData = new FormData();
      formData.append("file", file[0]);
      const { data } = await privateApi.post(
        "/api/v1/upload-file",
        formData
      );
      if (data.url) {
        setGovernmentID(data.url);
        sonnerToast.success("Document uploaded successfully!");
      }
    } catch (error: any) {
      sonnerToast.error(error.message || "Error uploading document.");
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
        const { data } = await privateApi.post(
          "/api/v1/delete-file",
          payload
        );
        if (data.success) {
          setGovernmentID(null);
          sonnerToast.success("File deleted successfully.");
        }
      } else {
        if (!attestationPreview) return;
        const payload = { fileUrl: attestationPreview };
        const { data } = await privateApi.post(
          "/api/v1/delete-file",
          payload
        );
        if (data.success) {
          setAttestationPreview(null);
          sonnerToast.success("File deleted successfully.");
        }
      }
    } catch (error: any) {
      sonnerToast.error(error.message || "Error deleting file.");
    } finally {
      setDocumentLoading(false);
    }
  };

  /** ============== Payment + Subscription Setup ============== */
  const getSecrete = async () => {
    try {
      const response = await privateApi.post(
        "/api/v1/providers/create-setup-intent",
        {
          customerId: contactData?.customer_id,
        }
      );
      const { clientSecret } = response.data;
      localStorage.setItem("client_secret", clientSecret);
      setClientSecret(clientSecret);
      // console.log(clientSecret);

      const { canChat } = getChatAccess(contactData);
      if (!canChat) {
        setIsTrialDialogOpen(true);
      }
    } catch (error) {
      // console.log("Error fetching Setup Intent:", error);
    }
  };

  /** ============== Reveal Contacts ============== */
  const openRevealContacts = async () => {
    const { trialActive, subscriptionActive, trialExpiredLegacy, canChat } =
      getChatAccess(contactData);
    const isVerified = contactData?.payment_verified === true;

    if (isVerified) {
      if (canChat) {
        setIsTrialExpired(false);
        return;
      }
      if (trialExpiredLegacy) {
        setIsDialogOpen(true);
        return;
      }
      setIsDialogOpen(true);
      return;
    }

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
        await refreshData()
    }
    // If the user has done 2 reveals, fallback to existing logic
    else {
      if (!trialActive && !subscriptionActive) {
        if (trialExpiredLegacy) {
          setIsDialogOpen(true);
        } else {
          setIsTrialExpired(true);
          openVerifyIdentity();
          getSecrete();
        }
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
      const setReveal = await privateApi.post(
        "/api/v1/auth/crud-operation",
        payload,
      );
      // console.log(setReveal, "setReveal");
      refreshData()
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
    const { canChat } = getChatAccess(contactData);
    setIsTrialExpired(!canChat);
   
  }, [contactData]);

  /** ============== Payment Cards: If dialog opens, fetch saved cards ============== */
  useEffect(() => {
    if (isDialogOpen) {
      fetchSavedCards();
    }
  }, [isDialogOpen]);

  const fetchSavedCards = async () => {
    try {
      const customerId = contactData?.customer_id;
      if (!customerId) return;
      const response = await privateApi.post(
        "/api/v1/providers/payment-methods",
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
    sonnerToast.success("Payment details verified successfully.");
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
        await privateApi.post(
          "/api/v1/auth/crud-operation",
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
          contactData?.hash,
          "Upload Attestation Document",
          payloadEvent
        );

        // Close the main trial dialog
        setIsTrialDialogOpen(false);
        // Show the new confirmation modal
        setShowAttestationConfirmation(true);

        // Refresh user data, and set trial as active (no longer expired)
        await refreshData()
        // setIsTrialExpired(false);
        setCurrentStep("selection");
      } catch (error) {
        console.log("Error saving attestation/ID docs:", error);
      } finally {
        setSubmitting(false);
      }
    } else {
      sonnerToast.error(
        "Please download/sign the attestation letter and upload it with a government ID."
      );
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

      <ProtectedCandidateDialogs
        showFirstRevealDialog={showFirstRevealDialog}
        setShowFirstRevealDialog={setShowFirstRevealDialog}
        showSecondRevealDialog={showSecondRevealDialog}
        setShowSecondRevealDialog={setShowSecondRevealDialog}
        openVerifyIdentity={openVerifyIdentity}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        closePricingDialog={closePricingDialog}
        isTrialDialogOpen={isTrialDialogOpen}
        setIsTrialDialogOpen={setIsTrialDialogOpen}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        clientSecret={clientSecret}
        userData={userData}
        contactData={contactData}
        setIsTrialExpired={setIsTrialExpired}
        closeRevealContacts={closeRevealContacts}
        handleOnSuccess={handleOnSuccess}
        attestationPreview={attestationPreview}
        documentLoading={documentLoading}
        handleDocumentUpload={handleDocumentUpload}
        deleteFile={deleteFile}
        submitDocument={submitDocument}
        submitting={submitting}
        downloadFile={downloadFile}
        showAttestationConfirmation={showAttestationConfirmation}
        setShowAttestationConfirmation={setShowAttestationConfirmation}
      />
    </>
  );
}

export default ProtectedCandidatesDetails;
