import { DialogProvider } from "@/Caregivers/CaregiverContext/DialogProvider";
import CaregiverDash from "@/Caregivers/DashBoard/CaregiverDash";
import React from "react";

function page() {
  return (
    <div>
      <DialogProvider>
        <CaregiverDash />
      </DialogProvider>
    </div>
  );
}

export default page;
