"use client";

import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { fetchContactsData, isTrialActive } from "@/lib/utils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { Cloudy, CreditCard, FileText, Loader, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import PaymentForm from "../User/PaymentForm";
import PricingPlan from "../User/PricingPlan";
import Dropzone from "react-dropzone";

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_TEST_KEY || "");
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
  console.log(customData, "customData");
  const [isTrialExpired, setIsTrialExpired] = useState(
    !(customData?.trial || customData?.subscribed)
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>("monthly");
  const [removedBlur, setRemoveBlur] = useState();
  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // this is for the verification
  const [currentStep, setCurrentStep] = useState<
    "selection" | "payment" | "attestation"
  >("selection");

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

  const [documentLoading, setDocumentLoading] = useState(false);
  const [attestationPreview, setAttestationPreview] = useState<string | null>(
    null
  );
  const [governmentID, setGovernmentID] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Handle Document Upload
  const handleDocumentUpload = async (file: File[]) => {
    try {
      setDocumentLoading(true);
      const formData = new FormData();
      formData.append("file", file[0]);

      // Upload document to server
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
      console.log(error);
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

      // Upload document to server
      const { data } = await axios.post(
        "https://api.kinscare.org/api/v1/upload-file",
        formData
      );

      if (data.url) {
        setGovernmentID(data.url);
        const userID = userData.userID;
        // Update user verification status in the database

        toast({
          title: "Document uploaded successfully!",
          description: "Your identity has been verified.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error uploading document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  // Handle File Deletion
  const deleteFile = async (file: any) => {
    if (file === "government") {
      console.log(file);
      try {
        setDocumentLoading(true);
        const payload = { fileUrl: governmentID };

        const { data } = await axios.post(
          "https://api.kinscare.org/api/v1/delete-file",
          payload
        );

        if (data.success) {
          setGovernmentID(null);
          toast({ title: "File deleted successfully", variant: "default" });
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
    } else {
      // console.log(file);
      try {
        setDocumentLoading(true);
        const payload = { fileUrl: attestationPreview };

        const { data } = await axios.post(
          "https://api.kinscare.org/api/v1/delete-file",
          payload
        );

        if (data.success) {
          setAttestationPreview(null);
          toast({ title: "File deleted successfully", variant: "default" });
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
    }
  };

  // stripe theme
  const appearance: any = {
    theme: "flat",
  };

  const openTrialDialogBox = async () => {
    const trialStart = customData?.trial_start_date;
    const trialEnd = customData?.trial_end_date;
    const isSubscribed = customData?.subscribed;

    if (trialStart && trialEnd) {
      const trialActive = isTrialActive(trialStart, trialEnd);
      // open the payment subscribe modal
      setIsDialogOpen(true);
    } else {
      try {
        const response = await axios.post(
          "https://api.kinscare.org/api/v1/providers/create-setup-intent",
          {
            customerId: user.customData.customer_id,
          }
        );
        console.log(response.data);
        const { clientSecret } = response.data;
        // Store the client secret in localStorage to persist across reloads
        localStorage.setItem("client_secret", clientSecret);
        setClientSecret(clientSecret);
        // console.log(response)
        // Close the dialog after sending
        const isNotVerified = !(
          customData?.trial === true || customData?.subscribe === true
        );
        if (isNotVerified) {
          setIsTrialDialogOpen(true);
        }
      } catch (error) {}
    }
  };
  const closeTrialDialogBox = () => {
    setIsTrialDialogOpen(false);
  };

  // Open dialog if trial has expired
  useEffect(() => {
    const trialStart = customData?.trial_start_date;
    const trialEnd = customData?.trial_end_date;
    const isSubscribed = customData?.subscribed;

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
      const trialFlag = customData?.trial || false;
      setIsTrialExpired(!trialFlag);
    }

    const fetchCustomData = async () => {
      const fetchedData: any = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      if (fetchedData) {
        // console.log(fetchedData.result, "rewsulet")
        await setCustomData(fetchedData.result);
      }
    };
    fetchCustomData();
  }, [user]);

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

  const closePricingDialog = () => {
    setIsDialogOpen(false);
  };
  const obfuscateText = (text: string): string => {
    // Check if the input is an email
    if (text.includes("@")) {
      const [localPart, domain] = text.split("@");
      if (localPart.length <= 2) return text; // Skip short emails
      const obfuscatedLocalPart = `${localPart.slice(0, 3)}${"*".repeat(
        Math.max(localPart.length - 6, 0)
      )}${localPart.slice(-3)}`;
      return `${obfuscatedLocalPart}@${domain}`;
    }

    // If not an email, treat as a name
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
  const handleOnSuccess = () => {
    toast({
      title: "Error",
      description: "Payment Details verified successfully",
      variant: "default",
    });
  };
  console.log(tel, "this is the tel", email);
  function formatPhoneNumberToDigitsWithPlus(phone: string): string {
    return phone.replace(/(?!^\+)\D/g, ""); // Keep + only if it's at the start, remove other non-digits
  }

  const encryptedEmail = obfuscateText(email);
  const encryptedTel = obfuscateText(formatPhoneNumberToDigitsWithPlus(tel));
  // console.log(isTrialExpired)
  const submitDocument = async () => {
    if (governmentID && attestationPreview) {
      try {
        setSubmitting(true);
        const userID = userData.userID;
        const freeTrialEndDate = new Date();
        freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);
        // Update user verification status in the database
        const payload = {
          collectionName: "contacts", // Specify the collection to update
          operation: "updateOne", // Specify the operation type
          filter: { userID, role: "provider" }, // Filter by userID and role
          update: {
            $set: {
              identity_verified: "pending",
              attestation_letter: attestationPreview,
              government_Id: governmentID,
              trial: true, // set this as true for the sake
              subscribed: false, // Mark subscription as inactive
              trial_start_date: new Date().toISOString(), // Set free trial start date
              trial_end_date: freeTrialEndDate.toISOString(), // Set free trial end date
            },
          },
        };
        await axios.post(
          "https://api.kinscare.org/api/v1/auth/crud-operation",
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setIsTrialDialogOpen(false);
        await user.refreshCustomData();
        setIsTrialExpired(false);
      } catch (error) {
      } finally {
        setSubmitting(false);
      }
    } else {
      toast({
        title: "Error submitting",
        description:
          "please Download and print an attestation letter, sign it, and upload it along with a government-issued ID containing your address.",
        variant: "destructive",
      });
    }
  };
  return (
    <>
      <h2 className="text-sm font-semibold">Contacts Information</h2>
      <div className="space-y-2 mt-1">
        {isTrialExpired ? (
          <div className="space-y-3">
            {/* Encrypted Email and Phone */}
            <div className="space-y-2 max-w-sm">
              <p
                className={`text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200`}
              >
                {encryptedEmail}
              </p>
              <p
                className={`text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200`}
              >
                {encryptedTel}
              </p>
            </div>
            {/* Reveal Contacts Message */}
            <p className="text-sm font-medium text-gray-600">
              Click the **Reveal Contacts** button below to view {name}'s email
              and phone number.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-w-sm">
            {/* Visible Email and Phone */}
            <p className="text-sm px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200">
              {email}
            </p>
            <p className="text-sm px-4 py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200">
              {tel}
            </p>
          </div>
        )}

        {/* Reveal Contacts Button */}
        {isTrialExpired && (
          <Button
            size="sm"
            onClick={openTrialDialogBox}
            className="w-full md:w-auto px-6 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition duration-200"
          >
            Reveal Contacts
          </Button>
        )}
      </div>

      {/* Dialog Box Payment */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl overflow-y-auto max-h-full mx-auto bg-gradient-to-b from-blue-50 via-white to-gray-50 rounded-lg shadow-2xl">
          <PricingPlan closePricingDialog={closePricingDialog} />
        </DialogContent>
      </Dialog>

      {/* Trial DialogBox  */}
      <Dialog open={isTrialDialogOpen} onOpenChange={setIsTrialDialogOpen}>
        <DialogContent className="h-[100vh] md:h-auto max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center text-center">
              <h2 className="font-bold tracking-tight text-xl text-gray-800">
                {currentStep === "selection" && "Choose a Verification Method"}
                {currentStep === "payment" &&
                  "Get Verified with Payment Method"}
                {currentStep === "attestation" &&
                  "Upload a Signed Attestation Letter Government-Issued ID"}
              </h2>
              {currentStep === "selection" && (
                <p className="text-sm text-gray-600">
                  To verify your identity and ensure a safe platform for
                  caregivers, we offer employers two verification options
                </p>
              )}
            </DialogTitle>
          </DialogHeader>

          {currentStep === "selection" && (
            <div className="space-y-6">
              <div
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:shadow-lg transition"
                onClick={() => setCurrentStep("payment")}
              >
                <CreditCard className="w-10 h-10 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-bold text-gray-800">
                    ⁠Add a Payment Method and Billing Zip Code
                  </h3>
                  <p className="text-sm text-gray-600">
                    This is a quick, secure, and widely used method to confirm
                    your identity. Rest assured, no charges will be applied to
                    your card.
                  </p>
                  <p className="mt-1 text-sm text-blue-600 font-medium">
                    Adding a payment method is the most common and convenient
                    way to verify your account. We recommend this option for a
                    faster, hassle-free experience!
                  </p>
                </div>
              </div>

              <div
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:shadow-lg transition"
                onClick={() => setCurrentStep("attestation")}
              >
                <FileText className="w-10 h-10 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-bold text-gray-800">
                    Upload a Signed Attestation Letter Government-Issued ID
                  </h3>
                  <p className="text-sm text-gray-600">
                    This option requires you to download and print an
                    attestation letter, sign it, and upload it along with a
                    government-issued ID containing your address.
                  </p>
                  <p className="mt-1 text-sm text-blue-600 font-medium">
                    This process takes more time but is equally effective.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === "payment" && (
            <>
              <div className="space-y-4 text-gray-600">
                <p className="text-sm">
                  To create a safe and professional environment for caregivers,
                  we require a valid payment method. This confirms that you’re a
                  genuine employer with sincere intent to hire {name}.
                </p>
                <p className="text-sm text-red-500">
                  Your card will not be charged.
                </p>
              </div>
              <div className="mt-4">
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
                      customerId={customData?.customer_id}
                      priceId="price_1QP2OuAoahxG9SLGNoc37Lxo"
                      intentType="setup"
                      onSuccess={(result) => {
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
              <button
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setCurrentStep("selection")}
              >
                Back to Verification Options
              </button>
            </>
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
                <p className="font-semibold tracking-tight antialiased ">
                  Attestation letter
                </p>
                {attestationPreview ? (
                  <div className="relative">
                    <iframe
                      src={attestationPreview}
                      className="w-full h-[300px]"
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
                    maxSize={3145728} // 3 MB limit
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
                                Drag and drop your attestation letter document
                                here (PDF/DOCX) or click to select
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Dropzone>
                )}
              </div>
              <div className="mt-4">
                <p className="font-semibold tracking-tight antialiased ">
                  Government issued ID
                </p>
                {governmentID ? (
                  <div className="relative">
                    <iframe src={governmentID} className="w-full h-[300px]" />
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
                    maxSize={3145728} // 3 MB limit
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
                                Drag and drop your signed governmentID document
                                here (PDF/DOCX) or click to select
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Dropzone>
                )}
              </div>

              <Button disabled={submitting} onClick={submitDocument}>
                {" "}
                {submitting && <Loader />} Submit Documents
              </Button>
              <button
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setCurrentStep("selection")}
              >
                Back to Verification Options
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProtectedCandidatesDetails;
