"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import MongoContext from "@/app/MongoContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import PricingPlan from "../User/PricingPlan";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SubscriptionUpgradeDialog from "../User/UpgradeSubscription";
import VerifyAccount from "../Candidates/VerifyAccount";
import UpgradeSubscription from "../User/UpgradeSubscription";

const ExclusiveOfferBanner = () => {
  const { customData }: any = useContext(MongoContext);
  const [plan, setPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (customData) {
      if (customData.first_reveal_done && !customData.payment_verified) {
        setShowVerifyBanner(true);
      } else {
        if (
          (customData?.plan &&
            customData.subscribed &&
            customData.plan === "daily") ||
          customData.plan === "weekly"
        ) {
          setShowUpgradeBanner(true);
        }
      }
    }
  }, [customData]);

  const offerText =
    customData?.plan === "daily"
      ? "Save 25% by upgrading to the monthly plan"
      : plan === "weekly"
      ? "Save 25% by upgrading to the monthly plan"
      : null;

  const handleStartTrial = () => setIsDialogOpen(true);
  const closePricingDialog = () => setIsDialogOpen(false);

  const handleOpenVerificationDialog = () => setIsVerificationDialogOpen(true);
  const verifyPaymentMethod = () => {
    setOpenModal(true);
    setIsVerificationDialogOpen(false);
  };

  if (!offerText && !customData.first_reveal_done) return null;
  console.log(showUpgradeBanner, "shks");
  return (
    <>
      {showVerifyBanner && (
        <>
          <div
            className={`sticky top-0 bg-red-500 px-4 py-2 sm:px-6 sm:py-1 z-10`}
          >
            <div
              className="absolute inset-0 -z-10 transform-gpu blur-2xl"
              aria-hidden="true"
            >
              <div
                className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-30"
                style={{
                  clipPath:
                    "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
                }}
              ></div>
            </div>
            <div
              className={`flex flex-wrap items-center justify-center max-w-screen-xl lg:ml-[16rem]`}
            >
              {/* Offer Text */}
              <p className="text-sm text-center sm:text-left antialiased  text-gray-200">
                <strong className="font-semibold">Required</strong> Complete
                Verification
              </p>

              {/* Upgrade Button */}
              <button
                onClick={handleOpenVerificationDialog}
                className="py-2 px-6 ml-5 flex shw  bg-red-50 hover:bg-red-200 text-red-600 text-xs font-bold rounded-md shadow-2xl focus:outline-none"
              >
                Fix it
              </button>

              {/* Dismiss Button */}
            </div>
          </div>
        </>
      )}
      {showUpgradeBanner && (
        <>
          {" "}
          <div
            className={`sticky top-0 bg-gray-100 px-4 py-2 sm:px-6 sm:py-1 z-10`}
          >
            <div
              className="absolute inset-0 -z-10 transform-gpu blur-2xl"
              aria-hidden="true"
            >
              <div
                className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-30"
                style={{
                  clipPath:
                    "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
                }}
              ></div>
            </div>
            <div
              className={`flex flex-wrap items-center justify-between max-w-screen-xl lg:ml-[16rem]`}
            >
              {/* Offer Text */}
              <p className="text-xs text-center sm:text-left font-medium text-gray-900">
                <strong className="font-semibold rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-800 px-3 py-1.5">
                  Exclusive Offer
                </strong>{" "}
                {offerText}
              </p>

              {/* Upgrade Button */}
              <Button
                variant="ghost"
                className="text-xs mt-2 sm:mt-0 sm:ml-4"
                onClick={handleStartTrial}
              >
                Upgrade now <ArrowRight />
              </Button>

              {/* Dismiss Button */}
            </div>
          </div>
        </>
      )}
      {/* Verification Dialog */}
      <Dialog
        open={isVerificationDialogOpen}
        onOpenChange={setIsVerificationDialogOpen}
      >
        <DialogContent  closePosition="left" className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <DialogTitle className="pt-4">Get Verified & Connect To More Caregivers</DialogTitle>
          <DialogDescription className="">
            You probably hate being solicited by scammers—and so do our
            caregivers. To prevent exploitation, we now require all employers to
            complete a quick, FREE one-time identity verification. This ensures
            trust, safety, and shows caregivers your interest is genuine. Verify
            now to help maintain a secure community!
          </DialogDescription>
          <Button
            className="mt-4 bg-blue-500 hover:bg-blue-700"
            onClick={verifyPaymentMethod}
          >
            Verify Now
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <UpgradeSubscription closePricingDialog={closePricingDialog} />
        </DialogContent>
      </Dialog>
      <VerifyAccount setOpenModal={setOpenModal} openModal={openModal} />
    </>
  );
};

export default ExclusiveOfferBanner;
