import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useState } from "react";
import SendReferralEmail from "../../SendReferralEmail";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";

function ReferEmployerUI() {
  const { openDialog } = useDialog();
  
    const handleOpenDialog = () => {
      openDialog(<SendReferralEmail/>);
    };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-tl from-blue-900 to-blue-900 p-6 shadow-lg transition-shadow hover:shadow-xl border border-transparent">
      {/* Background decorative gradient overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-indigo-900 to-blue-900"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col space-y-6 text-white">
        {/* Heading */}
        <div>
          <h3 className="text-lg font-semibold">Refer employer</h3>
          <p className="mt-2 text-sm text-blue-200">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ducimus
            explicabo qui dolorem ratione laboriosam quos praesentium culpa.
            Cumque,
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleOpenDialog}
          className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold rounded-lg shadow-md hover:from-blue-400 hover:to-blue-300 transition-all duration-300"
        >
          Refer an Employer
        </Button>
      </div>

      {/* Decorative background elements */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500 rounded-full blur-[60px] opacity-30"></div>
      <div className="absolute -top-6 -left-8 w-60 h-60 bg-indigo-600 rounded-full blur-[80px] opacity-25"></div>

     
    </div>
  );
}

export default ReferEmployerUI;
