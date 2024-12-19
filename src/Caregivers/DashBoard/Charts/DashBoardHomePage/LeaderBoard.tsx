"use client";
import React, { useContext } from "react";
import MongoContext from "@/app/MongoContext";
import AddCoursePlan from "../../AddCoursePlan";
import InviteFriends from "../../InviteFriends";
import AddWorkExperience from "../../AddWorkExperience";
import SendReferralEmail from "../../SendReferralEmail";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";

// Predefined Total Points for Each Task
const taskList = [
  {
    title: "Add Course Plan",
    totalPoints: 65,
    component: <AddCoursePlan />, // Dynamically rendered component
    field: "coursePlan",
  },
  {
    title: "Refer Friends",
    totalPoints: 90,
    component: <InviteFriends />,
    field: "inviteFriends",
  },
  {
    title: "Add Work Experience",
    totalPoints: 40,
    component: <AddWorkExperience />,
    field: "experience",
  },
  {
    title: "Refer Employer",
    totalPoints: 80,
    component: <SendReferralEmail />,
    field: "referEmployer",
  },
];

export default function Leaderboard() {
  const mongo: any = useContext(MongoContext);
  const { userData } = mongo;
  const { openDialog } = useDialog(); // Hook to open the dialog

  // Helper function to get user's points for a specific task field
  const getUserPoints = (field: string): number => {
    return userData?.careerProfile?.[field]?.points || 0;
  };

  // Calculate remaining points for each task and sort them
  const sortedActivities = taskList
    .map((task) => {
      const userPoints = getUserPoints(task.field);
      const remainingPoints = task.totalPoints - userPoints;
      return { ...task, userPoints, remainingPoints };
    })
    .sort((a, b) => b.remainingPoints - a.remainingPoints);

  return (
    <div className="p-6 bg-gradient-to-br bg-white shadow-sm rounded-2xl border border-gray-100">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Leaderboard
        </h2>
        <p className="text-sm text-gray-500">Complete tasks to rank higher!</p>
      </div>

      {/* Leaderboard */}
      <div className="grid gap-1">
        {sortedActivities.map((activity, index) => (
          <div
            key={index}
            onClick={() => openDialog(activity.component)} // Open specific component in dialog
            className="flex justify-between items-center bg-white p-3 px-4 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
          >
            {/* Left Section - Rank and Title */}
            <div className="flex items-center space-x-4">
              {/* Rank Badge */}
              <div className="w-6 h-6 flex text-sm items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-full">
                {index + 1}
              </div>
              {/* Activity Title */}
              <p className="text-gray-800 text-sm font-semibold">
                {activity.title}
              </p>
            </div>

            {/* Right Section - Remaining Points */}
            <p className="text-gray-600 text-sm font-medium">
              {activity.remainingPoints > 0
                ? `+${activity.remainingPoints} pts`
                : "Completed 🎉"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
