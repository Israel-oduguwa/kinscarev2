import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";

function ScoreBoardUi({ userData }: any) {
  const [totalScore, setTotalScore] = useState<number>(0);
  const recommendedScore = 250; // Recommended score for full progress
  const [rank, setRank] = useState<number | null>(null);
  const [totalCandidates, setTotalCandidates] = useState<number | null>(null);

  // Calculate Total Score
  const calculateTotalScore = () => {
    const coursePlanPoints = userData?.careerProfile?.coursePlan?.points || 0;
    const workExperiencePoints =
      userData?.careerProfile?.experience?.points || 0;
    const inviteFriendsPoints =
      userData?.careerProfile?.inviteFriends?.points || 0;
    const referEmployerPoints =
      userData?.careerProfile?.referEmployer?.points || 0;
    return (
      coursePlanPoints +
      workExperiencePoints +
      inviteFriendsPoints +
      referEmployerPoints
    );
  };

  useEffect(() => {
    if (userData) {
      const totalPoint = calculateTotalScore();
      setTotalScore(totalPoint);
      // fetchUserRank(totalPoint); // Fetch rank when score changes
    }
  }, [userData]);

  // Fetch the user's rank from MongoDB
  const fetchUserRank = async (userScore: number) => {
    try {
      const response = await axios.post("/api/get-rank", {
        score: userScore,
      });

      const { rank, totalUsers } = response.data;
      setRank(rank);
      setTotalCandidates(totalUsers);
    } catch (error) {
      console.error("Error fetching rank:", error);
    }
  };

  // Links recommendation logic
  const [recommendedLink, setRecommendedLink] = useState<string>("");

  useEffect(() => {
    recommendLink();
  }, [userData]);

  const recommendLink = () => {
    if (userData) {
      const workExperiencePoints =
        userData?.careerProfile?.experience?.points || 0;
      const inviteFriendsPoints =
        userData?.careerProfile?.inviteFriends?.points || 0;
      const referEmployerPoints =
        userData?.careerProfile?.referEmployer?.points || 0;
      const coursePlanPoints = userData?.careerProfile?.coursePlan?.points || 0;

      const maxPoints = {
        workExperience: 40,
        inviteFriends: 60,
        referEmployer: 70,
        coursePlan: 100,
      };

      const remainingPoints = {
        workExperience: maxPoints.workExperience - workExperiencePoints,
        inviteFriends: maxPoints.inviteFriends - inviteFriendsPoints,
        referEmployer: maxPoints.referEmployer - referEmployerPoints,
        coursePlan: maxPoints.coursePlan - coursePlanPoints,
      };

      const links = {
        workExperience: "/vitae/add-work-experience",
        inviteFriends: "/vitae/refer-friends",
        referEmployer: "/vitae/refer-employer",
        coursePlan: "/vitae/add-course-plan",
      };

      const [recommendedTask] = Object.entries(remainingPoints).sort(
        ([, a], [, b]) => b - a
      );

      setRecommendedLink(links[recommendedTask[0]]);
    }
  };

  // Progress percentage relative to the recommended score
  const progressPercentage = Math.min(
    (totalScore / recommendedScore) * 100,
    100
  );

  return (
    <div className="shadow-lg p-6 bg-white rounded-xl">
      {/* User's Score */}
      <p className="text-sm antialiased">Your Score</p>
      <p className="text-2xl text-slate-800 font-semibold antialiased">
        {totalScore}
        <span className="text-sm"> points</span>
      </p>
      <Separator className="border border-dashed my-4 border-slate-200" />

      {/* Progress Bar */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <p className="text-sm">Recommended Score</p>
          <p className="text-sm">{recommendedScore}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-5">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-700 h-5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Ranking Section */}
      {/* <div>
        <p className="text-sm antialiased font-medium">Ranking</p>
        <p className="text-xl antialiased font-semibold">
          {rank !== null ? (
            <>
              <span className="font-normal">#</span>
              {rank}{" "}
              <span className="text-sm font-medium text-gray-500">
                of {totalCandidates} candidates
              </span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">Loading...</span>
          )}
        </p>
      </div> */}

      {/* Recommendation Button */}
      <div className="mt-4">
        {recommendedLink ? (
          <Link href={recommendedLink}>
            <Button variant="secondary">Increase Score</Button>
          </Link>
        ) : (
          <p className="text-gray-600">No recommendations available.</p>
        )}
      </div>
    </div>
  );
}

export default ScoreBoardUi;
