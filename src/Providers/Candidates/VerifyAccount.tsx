"use client";

import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { Cloudy, FileText, Loader, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import PaymentForm from "../User/PaymentForm";

/** Stripe setup */
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_TEST_KEY || "");

/**
 * This component handles:
 *  - Hiding/obfuscating caregiver contact info unless certain conditions (trial, subscription, or verification) are met.
 *  - A 4-second wait the first and second times an employer clicks "Reveal Contacts" before showing the real info.
 *  - Displaying popups prompting identity verification on the 1st and 2nd reveal attempts.
 *  - Handling subscription/trial dialogs, uploading attestation letter & ID for verification, etc.
 */
function VerifyAccount({ openModal, setOpenModal }: { openModal: boolean, setOpenModal:any }) {
  const { user, userData, customData, setCustomData }: any =
    useContext(MongoContext);
    console.log(openModal)

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

  /** For the "Verify Identity" trial dialog steps: selection/payment/attestation */
  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(openModal);
  const [currentStep, setCurrentStep] = useState<
    "selection" | "payment" | "attestation"
  >("selection");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setIsTrialDialogOpen(openModal)
    getSecrete()
  }, [openModal])
  


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

     
    } catch (error) {
      console.log("Error fetching Setup Intent:", error);
    }
  };


 

  const closeRevealContacts = () => {
    setIsTrialDialogOpen(false);
  };

  /** ============== On Mount: Check Subscription/Trial ============== */
  useEffect(() => {
    const trialStart = customData?.trial_start_date;
    const trialEnd = customData?.trial_end_date;
    const isSubscribed = customData?.subscribed;

    if (isSubscribed) {
      setIsTrialExpired(false);
      return;
    }
    if (trialStart && trialEnd) {
      const trialActive = isTrialActive(trialStart, trialEnd);
      setIsTrialExpired(!trialActive);
    } else {
      const trialFlag = customData?.trial || false;
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
    const fileUrl = "https://kinscare-storage.s3.us-east-1.amazonaws.com/Kinscare_assets/KinsCare_Provider_Verification_Form+(2).pdf";
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "kinscare_Attestation_Form.pdf";
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
      {/* ============== TRIAL VERIFICATION (ATT. LETTER / PAYMENT) DIALOG ============== */}
      <Dialog  open={isTrialDialogOpen} onOpenChange={setOpenModal}>
        <DialogContent closePosition="left" className="h-[100vh] md:h-auto max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center text-center">
              <h2 className="font-bold tracking-tight text-2xl text-gray-800">
                {currentStep === "selection" &&
                  "Choose one of the two options below."}
                {currentStep === "payment" &&
                  "Get Verified with Payment Method"}
                {currentStep === "attestation" &&
                  "Upload a Signed Attestation Letter & Government-Issued ID"}
              </h2>
              {currentStep === "selection" && (
                <p className="text-gray-700">
                  To protect caregivers and ensure a safe platform, choose one
                  of these verification options:
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
              <h3 className="font-bold text-gray-800">
                2. Upload a Signed Attestation Letter & Government-Issued ID
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
                Submit Documents
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
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

export default VerifyAccount;