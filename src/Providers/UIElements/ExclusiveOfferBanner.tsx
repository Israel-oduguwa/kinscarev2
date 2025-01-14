"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import MongoContext from "@/app/MongoContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PricingPlan from "../User/PricingPlan";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ExclusiveOfferBanner = () => {
  const { customData }: any = useContext(MongoContext);
  const [plan, setPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (customData?.plan) {
      setPlan(customData.plan);
    }
  }, [customData]);

  const offerText =
    plan === "daily"
      ? "Save 15% by upgrading to the weekly plan"
      : plan === "weekly"
      ? "Save 25% by upgrading to the monthly plan"
      : null;

  if (!offerText) return null;

  const handleStartTrial = () => setIsDialogOpen(true);
  const closePricingDialog = () => setIsDialogOpen(false);

  return (
    <>
      <div className={`sticky top-0 bg-gray-50 px-4 py-2 sm:px-6 sm:py-1 z-10`}>
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
          className={`flex flex-wrap items-center justify-between w-full lg:ml-[16rem]`}
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
          <div className="mt-2 sm:mt-0 flex flex-1 justify-end">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <PricingPlan closePricingDialog={closePricingDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExclusiveOfferBanner;
