import { Button } from "@/components/ui/button";
import React from "react";
import { Users, Gift, ArrowRight } from "lucide-react";
import InviteFriends from "../../InviteFriends";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";

function InviteFriendUI({ userData }: any) {
  const { openDialog } = useDialog();

  const handleOpenDialog = () => {
    openDialog(<InviteFriends />);
  };

  const invites = userData?.careerProfile?.inviteFriends?.invites ?? 0;
  const totalPoints = userData?.careerProfile?.inviteFriends?.points ?? 0;
  const progressWidth = Math.min(100, (invites / 3) * 100);

  return (
    <div className="relative overflow-hidden min-h-[244px] rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 p-6 shadow-sm transition-shadow hover:shadow-xl">
      {/* Subtle radial highlights */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />

      <div className="relative z-10 flex h-full flex-col gap-5">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white">
            Invite friends
          </h3>
          <p className="mt-1 text-sm text-indigo-100">
            Earn points when friends join Kinscare. First 3 invites earn extra.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            <Users className="h-4 w-4" />
            {invites} invites
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            <Gift className="h-4 w-4" />
            {totalPoints} pts
          </span>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Button
            onClick={handleOpenDialog}
            className="w-full sm:w-auto bg-white text-indigo-700 hover:bg-indigo-50 font-semibold"
          >
            Invite now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Progress (milestone: 3 invites) */}
        <div className="mt-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-indigo-100">
            Milestone: 3 invites for bonus points
          </p>
        </div>
      </div>

      {/* Decorative blurs */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/15 blur-xl" />
      <div className="absolute -bottom-8 -left-12 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}

export default InviteFriendUI;
