import { Button } from "@/components/ui/button";
import React from "react";
import { Building2, Gift, ArrowRight } from "lucide-react";
import SendReferralEmail from "../../SendReferralEmail";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";

function ReferEmployerUI() {
  const { openDialog } = useDialog();
  const handleOpenDialog = () => openDialog(<SendReferralEmail />);

  return (
    <div className="relative overflow-hidden min-h-[220px] rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 shadow-sm transition-shadow hover:shadow-xl">
      {/* Subtle radial highlights */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />

      <div className="relative z-10 flex h-full flex-col gap-5">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white">Refer an employer</h3>
          <p className="mt-1 text-sm text-blue-100">
           Know an employer or family looking to hire caregivers, Share a hiring contact and help them post roles so they can post a job and connect with great candidates. Earn points when they engage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            <Building2 className="h-4 w-4" />
            Employer referral
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            <Gift className="h-4 w-4" />
            Bonus points
          </span>
        </div>

        <div className="mt-auto">
          <Button
            onClick={handleOpenDialog}
            className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold"
          >
            Refer employer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Decorative blurs */}
      <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -top-6 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}

export default ReferEmployerUI;
