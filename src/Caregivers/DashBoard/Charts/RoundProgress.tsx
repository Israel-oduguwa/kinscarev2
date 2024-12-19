"use client";
import MongoContext from "@/app/MongoContext";
import React, { useContext, useEffect, useState } from "react";

const MAX_COURSE_PLAN_POINTS = 90;
const MAX_WORK_EXPERIENCE_POINTS = 40;
const MAX_INVITE_FRIENDS_POINTS = 45;
const MAX_REFER_EMPLOYER_POINTS = 75;

// Weighting factors for prioritizing Course Plan and Work Experience
const COURSE_PLAN_WEIGHT = 0.4; // 40% weight for course plan
const WORK_EXPERIENCE_WEIGHT = 0.4; // 40% weight for work experience
const INVITE_FRIENDS_WEIGHT = 0.1; // 10% weight for invite friends
const REFER_EMPLOYER_WEIGHT = 0.1; // 10% weight for refer employer

type FloatingProgressButtonProps = {
  progress: number;
};

function RoundProgress() {
  const mongodb: any = useContext(MongoContext);
  const { userData } = mongodb;
  const [progress, setProgress] = useState(0);

  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animation effect to fill progress gradually
  useEffect(() => {
    let progressInterval = setInterval(() => {
      setAnimatedProgress((prev) => {
        if (prev < progress) {
          return prev + 1; // Increase gradually until it reaches `progress`
        } else {
          clearInterval(progressInterval);
          return progress;
        }
      });
    }, 15); // Speed of animation

    return () => clearInterval(progressInterval); // Cleanup interval on unmount
  }, [progress]);

  const calculatePercentage = (
    points: number,
    maxPoints: number,
    weight: number
  ) => {
    return (points / maxPoints) * weight * 100;
  };

  useEffect(() => {
    if (userData) {
      // Get points from user data
      const coursePlanPoints = userData?.careerProfile?.coursePlan?.points || 0;
      const workExperiencePoints =
        userData?.careerProfile?.experience?.points || 0;
      const inviteFriendsPoints =
        userData?.careerProfile?.inviteFriends?.points || 0;
      const referEmployerPoints =
        userData?.careerProfile?.referEmployer?.points || 0;

      // Calculate weighted progress
      const coursePlanProgress = calculatePercentage(
        coursePlanPoints,
        MAX_COURSE_PLAN_POINTS,
        COURSE_PLAN_WEIGHT
      );
      const workExperienceProgress = calculatePercentage(
        workExperiencePoints,
        MAX_WORK_EXPERIENCE_POINTS,
        WORK_EXPERIENCE_WEIGHT
      );
      const inviteFriendsProgress = calculatePercentage(
        inviteFriendsPoints,
        MAX_INVITE_FRIENDS_POINTS,
        INVITE_FRIENDS_WEIGHT
      );
      const referEmployerProgress = calculatePercentage(
        referEmployerPoints,
        MAX_REFER_EMPLOYER_POINTS,
        REFER_EMPLOYER_WEIGHT
      );

      // Sum all weighted progress
      const totalProgress =
        coursePlanProgress +
        workExperienceProgress +
        inviteFriendsProgress +
        referEmployerProgress;

      setProgress(totalProgress); // Update the progress state
    }
  }, [userData]); // Recalculate when userData changes
  // console.log(progress);
  return (
    <>
      {userData && (
        <div className="fixed z-10 bottom-8 right-8">
          <div className="flex items-center space-x-3 bg-white shadow-lg p-2 px-6 rounded-full">
            <div className="relative w-12 h-12">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gray-300 to-gray-100"></div>

              {/* Animated Progress circle */}
              <div
                className="absolute inset-0 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] rotate-[-90deg]"
                style={{
                  background: `conic-gradient(
                 #1e3a8a ${animatedProgress * 3.6}deg,
                 #e5e7eb ${animatedProgress * 3.6}deg 360deg
               )`,
                  transition: "background 0.4s ease",
                }}
              ></div>

              {/* Inner circle with percentage text */}
              <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">
                  {Math.round(animatedProgress)}%
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold text-blue-800 antialiased">
              Complete Profile
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default RoundProgress;
