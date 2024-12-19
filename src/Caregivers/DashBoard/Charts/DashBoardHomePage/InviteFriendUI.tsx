import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useState } from "react";
import InviteFriends from "../../InviteFriends";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";

function InviteFriendUI({ userData }: any) {
  const { openDialog } = useDialog();
  
    const handleOpenDialog = () => {
      openDialog(<InviteFriends/>);
    };
  

  return (
    <div className="relative overflow-hidden min-h-[244px] rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500 p-6 shadow-sm transition-shadow hover:shadow-xl">
      {/* Background elements for a more dynamic, modern feel */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-r from-blue-900 to-blue-700"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col space-y-6">
        {/* Heading */}
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Invite friends
          </h3>
          <p className="mt-2 text-sm text-blue-100">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus
            explicabo qui dolorem ratione laboriosam quos praesentium culpa.
            Cumque,
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleOpenDialog}
          className="px-5 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-100 transition-all duration-300"
        >
          Invite
        </Button>
      </div>

    

      {/* Decorative floating elements for a polished look */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white bg-opacity-20 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 -left-12 w-72 h-72 bg-white bg-opacity-20 rounded-full blur-2xl"></div>
    </div>
  );
}

export default InviteFriendUI;
