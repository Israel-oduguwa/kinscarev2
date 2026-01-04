/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import Dropzone from "react-dropzone";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PaymentForm from "../User/PaymentForm";
import PricingPlan from "../User/PricingPlan";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY || "");
const appearance: any = { theme: "flat" };

type StepKey = "selection" | "payment" | "attestation";

type ProtectedCandidateDialogsProps = {
  showFirstRevealDialog: boolean;
  setShowFirstRevealDialog: (open: boolean) => void;
  showSecondRevealDialog: boolean;
  setShowSecondRevealDialog: (open: boolean) => void;
  openVerifyIdentity: () => Promise<void> | void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  closePricingDialog: () => void;
  isTrialDialogOpen: boolean;
  setIsTrialDialogOpen: (open: boolean) => void;
  currentStep: StepKey;
  setCurrentStep: (step: StepKey) => void;
  clientSecret: string | null;
  userData: any;
  contactData: any;
  setIsTrialExpired: (value: boolean) => void;
  closeRevealContacts: () => void;
  handleOnSuccess: () => void;
  attestationPreview: string | null;
  documentLoading: boolean;
  handleDocumentUpload: (files: File[]) => void;
  deleteFile: (file: any) => void;
  submitDocument: () => void;
  submitting: boolean;
  downloadFile: () => void;
  showAttestationConfirmation: boolean;
  setShowAttestationConfirmation: (open: boolean) => void;
};

export default function ProtectedCandidateDialogs({
  showFirstRevealDialog,
  setShowFirstRevealDialog,
  showSecondRevealDialog,
  setShowSecondRevealDialog,
  openVerifyIdentity,
  isDialogOpen,
  setIsDialogOpen,
  closePricingDialog,
  isTrialDialogOpen,
  setIsTrialDialogOpen,
  currentStep,
  setCurrentStep,
  clientSecret,
  userData,
  contactData,
  setIsTrialExpired,
  closeRevealContacts,
  handleOnSuccess,
  attestationPreview,
  documentLoading,
  handleDocumentUpload,
  deleteFile,
  submitDocument,
  submitting,
  downloadFile,
  showAttestationConfirmation,
  setShowAttestationConfirmation,
}: ProtectedCandidateDialogsProps) {
  return (
    <>
      {/* ============== FIRST REVEAL DIALOG ============== */}
      <Dialog
        open={showFirstRevealDialog}
        onOpenChange={setShowFirstRevealDialog}
      >
        <DialogContent className="[&>button]:hidden">
          <DialogHeader className="flex flex-row items-start space-x-1">
            <DialogClose className="p-1 rounded-full hover:bg-muted focus:outline-none">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
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
            contactData?.plan && contactData?.subscription_status === "expired"
              ? "max-w-3xl"
              : "max-w-6xl"
          } overflow-y-auto max-h-full mx-auto rounded-2xl bg-white shadow-2xl`}
        >
          <PricingPlan closePricingDialog={closePricingDialog} />
        </DialogContent>
      </Dialog>

      {/* ============== TRIAL VERIFICATION (ATT. LETTER / PAYMENT) DIALOG ============== */}
      <Dialog open={isTrialDialogOpen} onOpenChange={setIsTrialDialogOpen}>
        <DialogContent
          closePosition="left"
          className="max-w-4xl! p-0 m-0 space-y-0 overflow-y-auto h-[70vh] bg-white"
        >
          <div className="px-4 md:px-8">
            <div className="relative pb-4 pt-6 border-b border-slate-100">
              <div className="absolute top-4 right-4 flex items-center">
                <BadgeCheck className="text-emerald-500 mr-2" size={18} />
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  Secure verification
                </span>
              </div>
              <DialogHeader>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Identity verification
                </p>
                <DialogTitle className="mt-2 text-2xl font-bold text-slate-900">
                  {currentStep === "selection" &&
                    "Get Verified & Connect To More Caregivers"}
                  {currentStep === "attestation" && "Document verification"}
                </DialogTitle>
                {currentStep === "selection" && (
                  <DialogDescription className="text-sm text-slate-600">
                   To protect our caregivers and ensure a safe platform,
                        verify your identity with one of these options
                  </DialogDescription>
                )}
              </DialogHeader>
            </div>
            {currentStep === "selection" && (
              <div className="py-6 space-y-6">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <CreditCard className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Instant verification with card
                      </h3>
                      <p className="text-xs text-blue-700 font-medium">
                        Recommended
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Fast, secure, and free. Add a card to verify instantly.
                  </p>

                  <div className="mt-5">
                    {clientSecret && userData ? (
                      <Elements
                        stripe={stripePromise}
                        options={{ clientSecret, appearance }}
                      >
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <PaymentForm
                            close={closeRevealContacts}
                            setIsTrialExpired={setIsTrialExpired}
                            clientSecret={clientSecret}
                            userID={userData.userID}
                            customerId={contactData?.customer_id}
                            priceId="price_1QP2OuAoahxG9SLGNoc37Lxo"
                            intentType="setup"
                            onSuccess={() => {
                              handleOnSuccess();
                            }}
                            onError={(error) => {
                              console.error("Error saving card:", error);
                              toast.error(
                                "We couldn't save your card. Please try again."
                              );
                            }}
                          />
                        </div>
                      </Elements>
                    ) : (
                      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10">
                        <Loader2
                          className="animate-spin text-blue-500"
                          size={24}
                        />
                        <span className="ml-2 text-sm text-slate-600">
                          Loading secure payment...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-200 transition-colors cursor-pointer"
                  onClick={() => setCurrentStep("attestation")}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2">
                      <FileText className="text-slate-600" size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Manual verification with documents
                      </h3>
                      <p className="text-xs text-slate-500">
                        Review in 1–2 business days
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Upload signed attestation letter and government ID. This
                    process may take 2-5 business days.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={() => setCurrentStep("attestation")}
                  >
                    Choose manual verification
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "attestation" && (
              <div className="space-y-6 py-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Upload required documents
                  </h3>
                  <p className="text-sm text-slate-600">
                    Provide the items below to complete manual verification.
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
                      className="inline-flex items-center justify-center ml-6 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full shadow hover:bg-blue-700 transition"
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
                        <div className="relative bg-slate-50 rounded-lg border border-slate-200 p-4">
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
                              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-300 bg-slate-50 transition-colors"
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
                                      className="text-slate-400 mb-2"
                                      size={24}
                                    />
                                    <p className="font-medium text-slate-700">
                                      Drag & drop your file here
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                      or click to browse
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">
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
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50"
                    onClick={() => setCurrentStep("selection")}
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    Back to options
                  </Button>
                  <Button
                    disabled={!attestationPreview || submitting}
                    onClick={submitDocument}
                    className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full shadow hover:bg-blue-700 transition"
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

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
            <div className="flex items-center text-sm text-slate-500">
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
                  customerId={contactData?.customer_id}
                  priceId="price_1QP2OuAoahxG9SLGNoc37Lxo"
                  intentType="setup"
                  onSuccess={() => {
                    handleOnSuccess();
                    setShowAttestationConfirmation(false);
                  }}
                  onError={(error) => {
                    console.error("Error saving card:", error);
                    toast.error(
                      "We couldn't save your card. Please try again."
                    );
                  }}
                />
              </Elements>
            ) : (
              <p className="text-sm text-slate-600">Loading Payment Form...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
