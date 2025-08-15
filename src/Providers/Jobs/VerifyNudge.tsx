"use client";

import React, { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import VerifyAccount from "../Candidates/VerifyAccount";

export default function VerifyNudge() {
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const verifyPaymentMethod = () => {
    setOpenModal(true);
    setIsVerificationDialogOpen(false);
  };

  return (
    <>
      {/* Nudge card (inspired by your image) */}
      <div className="rounded-2xl border border-amber-200 ring-1 ring-amber-100/60 bg-gradient-to-b from-white to-amber-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100">
              <ShieldAlert size={20} className="text-amber-700" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-gray-900">
                Unverified
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                This is how your job currently appears to caregivers. Verify to display a
                green badge and boost trust & response rate.
              </p>
            </div>
          </div>
        </div>

        {/* Side-by-side preview states */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-gray-900">Unverified</p>
              <ShieldAlert size={22} className="text-amber-600" />
            </div>
            <p className="mt-1 text-sm text-gray-700">
              You still need to verify—here’s why and how.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-gray-900">Verified</p>
              <ShieldCheck size={22} className="text-emerald-600" />
            </div>
            <p className="mt-1 text-sm text-gray-700">
              Identity verified—trusted by caregivers.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setIsVerificationDialogOpen(true)}
          >
            Get Verified (Free)
          </Button>
          <p className="text-xs text-gray-600">
            ~1 minute • free • helps your job post stand out
          </p>
        </div>
      </div>

      {/* Explanation + action dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <DialogTitle className="pt-4">
            Get Verified & Connect To More Caregivers
          </DialogTitle>
          <DialogDescription>
            You probably hate being solicited by scammers and so do our caregivers. To
            prevent exploitation, we now require all employers to complete a quick, FREE
            one-time identity verification. This ensures trust, safety, and shows
            caregivers your interest is genuine. Verify now to help maintain a secure
            community!
          </DialogDescription>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            onClick={verifyPaymentMethod}
          >
            Verify Now
          </Button>
        </DialogContent>
      </Dialog>

      {/* Your existing verification flow */}
      <VerifyAccount setOpenModal={setOpenModal} openModal={openModal} />
    </>
  );
}
