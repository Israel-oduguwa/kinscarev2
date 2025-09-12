"use client";
import React, { useContext } from "react";
import MongoContext from "@/app/MongoContext";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";
import AddCoursePlan from "../../AddCoursePlan";
import InviteFriends from "../../InviteFriends";
import AddWorkExperience from "../../AddWorkExperience";
import SendReferralEmail from "../../SendReferralEmail";

// (UI-only) Trophy icon look made with CSS; no extra icon imports needed

// Predefined Total Points for Each Task
const taskList = [
  {
    title: "Add Course Plan",
    totalPoints: 65,
    component: <AddCoursePlan />,
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
  const { openDialog } = useDialog();

  const getUserPoints = (field: string): number =>
    userData?.careerProfile?.[field]?.points || 0;

  const sortedActivities = taskList
    .map((task) => {
      const userPoints = getUserPoints(task.field);
      const remainingPoints = task.totalPoints - userPoints;
      return { ...task, userPoints, remainingPoints };
    })
    .sort((a, b) => b.remainingPoints - a.remainingPoints);

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Subtle gradient header stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 rounded-t-2xl" />

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Leaderboard
            </h2>
            <p className="text-xs text-gray-500">
              Complete tasks to rank higher.
            </p>
          </div>

          {/* Tiny pill badge */}
          <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
            Personalized tasks
          </span>
        </div>

        {/* Compact list */}
        <div className="grid gap-2">
          {sortedActivities.map((activity, index) => {
            const progress =
              activity.totalPoints > 0
                ? Math.max(
                    0,
                    Math.min(
                      100,
                      Math.round((activity.userPoints / activity.totalPoints) * 100)
                    )
                  )
                : 0;

            const completed = activity.remainingPoints <= 0;

            return (
              <button
                key={index}
                onClick={() => openDialog(activity.component)}
                className={[
                  "group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-2.5 transition",
                  "hover:bg-gray-50 hover:shadow-sm",
                ].join(" ")}
              >
                {/* Left: Rank badge */}
                <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[12px] font-bold text-indigo-700">
                  {index + 1}
                </div>

                {/* Middle: Title + micro progress */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {activity.title}
                    </p>
                  </div>

                  {/* Micro progress + score */}
                  <div className="mt-1 flex items-center gap-2">
                    {/* <div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div> */}
                    <span className="shrink-0 text-[11px] text-gray-500">
                      {activity.userPoints}/{activity.totalPoints}
                    </span>
                  </div>
                </div>

                {/* Right: status pill */}
                <div className="ml-3 shrink-0">
                  {completed ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      Completed 🎉
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      +{activity.remainingPoints} pts
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
