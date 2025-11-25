/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-dropdown-menu"; // kept as-is to avoid logic changes
import React, { useEffect, useState } from "react";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";
import AddCoursePlan from "../../AddCoursePlan";
import InviteFriends from "../../InviteFriends";
import AddWorkExperience from "../../AddWorkExperience";
import SendReferralEmail from "../../SendReferralEmail";
import { useApiClient } from "@/hooks/useApiClient";
import { Gauge } from "lucide-react";

function ScoreBoardUi({ userData }: any) {
  const [totalScore, setTotalScore] = useState<number>(0);
  const recommendedScore = 200  // this was before 250;
  const [rank, setRank] = useState<number | null>(null);
  const [totalCandidates, setTotalCandidates] = useState<number | null>(null);
  const { openDialog } = useDialog();

  const taskComponents = {
    coursePlan: <AddCoursePlan />,
    inviteFriends: <InviteFriends />,
    workExperience: <AddWorkExperience />,
    referEmployer: <SendReferralEmail />,
  };

  const maxPoints = { workExperience: 40, inviteFriends: 60, referEmployer: 70, coursePlan: 100 };

  const calculateTotalScore = () => {
    const coursePlanPoints = userData?.careerProfile?.coursePlan?.points || 0;
    const workExperiencePoints = userData?.careerProfile?.experience?.points || 0;
    const inviteFriendsPoints = userData?.careerProfile?.inviteFriends?.points || 0;
    const referEmployerPoints = userData?.careerProfile?.referEmployer?.points || 0;
    return coursePlanPoints + workExperiencePoints + inviteFriendsPoints + referEmployerPoints;
  };

  useEffect(() => {
    if (userData) setTotalScore(calculateTotalScore());
  }, [userData]);

  const fetchUserRank = async (userScore: number) => {
    try {
      const response = await privateApi.post("/api/get-rank", { score: userScore });
      const { rank, totalUsers } = response.data;
      setRank(rank);
      setTotalCandidates(totalUsers);
    } catch (error) {
      console.error("Error fetching rank:", error);
    }
  };

  const [recommendedTask, setRecommendedTask] = useState<any>("");
  useEffect(() => { recommendTask(); }, [userData]);

  const recommendTask = () => {
    if (!userData) return;
    const workExperiencePoints = userData?.careerProfile?.experience?.points || 0;
    const inviteFriendsPoints = userData?.careerProfile?.inviteFriends?.points || 0;
    const referEmployerPoints = userData?.careerProfile?.referEmployer?.points || 0;
    const coursePlanPoints = userData?.careerProfile?.coursePlan?.points || 0;

    const remainingPoints = {
      workExperience: maxPoints.workExperience - workExperiencePoints,
      inviteFriends: maxPoints.inviteFriends - inviteFriendsPoints,
      referEmployer: maxPoints.referEmployer - referEmployerPoints,
      coursePlan: maxPoints.coursePlan - coursePlanPoints,
    };

    const [taskWithMostPoints] = Object.entries(remainingPoints).sort(([, a], [, b]) => b - a);
    setRecommendedTask(taskWithMostPoints[0]);
  };

  const progressPercentage = Math.min((totalScore / recommendedScore) * 100, 100);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Score header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Your Score</p>
          <p className="text-2xl font-semibold text-slate-800">
            {totalScore}
            <span className="text-sm font-normal text-gray-500"> pts</span>
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Gauge className="h-5 w-5" />
        </div>
      </div>

      <Separator className="border border-dashed my-4 border-slate-200" />

      {/* Progress to recommended */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">Recommended score</p>
          <p className="text-gray-700">{recommendedScore}</p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-500">
          {Math.round(progressPercentage)}% of recommended target
        </p>
      </div>

      <div className="my-4 h-px w-full bg-gray-100" />

      {/* Recommendation */}
      <div className="mt-2">
        {recommendedTask ? (
          <Button
            variant="outline"
            onClick={() => openDialog((taskComponents as any)[recommendedTask])}
            className="w-full sm:w-auto"
          >
            Increase score
          </Button>
        ) : (
          <p className="text-sm text-gray-600">No recommendations available.</p>
        )}
      </div>
    </div>
  );
}

export default ScoreBoardUi;
 