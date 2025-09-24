"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useContext } from "react";

import RoundProgress from "./Charts/RoundProgress";
import CoursePlanUi from "./Charts/DashBoardHomePage/CoursePlanUi";
import WorkExperienceUi from "./Charts/DashBoardHomePage/WorkExperienceUi";
import InviteFriendUI from "./Charts/DashBoardHomePage/InviteFriendUI";
import ReferEmployerUI from "./Charts/DashBoardHomePage/ReferEmployerUI";
import ScoreBoardUi from "./Charts/DashBoardHomePage/ScoreBoardUi";
import ProfessionProfile from "./Charts/DashBoardHomePage/ProfessionProfile";
import LeaderBoard from "./Charts/DashBoardHomePage/LeaderBoard";
import ForumRedirect from "./Charts/DashBoardHomePage/ForumRedirect";
import CareerMapPage from "../CareerMap/CareerMapPage";
import ProgramRecommendation from "../Explore/ProgramRecommendation";

// ⬇️ Add this import; adjust path if your file lives elsewhere


function CaregiverDash() {
  const mongodb: any = useContext(MongoContext);
  const { userData, user } = mongodb;

  return (
    <div className="py-10 px-3 bg-gray-50 md:px-4 min-h-[100vh]">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 w-full">
          <div className="mb-0.5 flex items-center space-x-2">
            <h2 className="flex items-center space-x-2 text-2xl md:text-3xl font-bold md:font-semibold antialiased text-gray-900">
              Hi,{" "}
              {userData ? (
                `${userData.fname} ${userData.lname}`
              ) : (
                <Skeleton className="ml-2 h-9 w-80 bg-slate-200" />
              )}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Complete these steps to land your next role
          </p>
        </div>

        <div className="flex flex-col space-y-8">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="col-span-12 md:col-span-12 lg:col-span-7">
              <LeaderBoard />
            </div>
            <div className="col-span-12 md:col-span-12 lg:col-span-5">
              <ProfessionProfile user={user} userData={userData} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="col-span-12 md:col-span-12 lg:col-span-4">
              <ScoreBoardUi userData={userData} />
            </div>
            <div className="col-span-12 md:col-span-12 lg:col-span-4">
              <CoursePlanUi userData={userData} />
            </div>
            <div className="col-span-12 md:col-span-12 lg:col-span-4">
              <WorkExperienceUi userData={userData} />
            </div>
          </div>

         
        </div>
           {/* NEW: Career Map (full-width hero section) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="col-span-12 py-6">
            
              {/* Inline embed of your full CareerMap experience */}
             <ProgramRecommendation />
            </div>
          </div>
          <div className="flex">
             {/* Row 3 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="col-span-12 md:col-span-12 lg:col-span-4">
              <ReferEmployerUI />
            </div>
            <div className="col-span-12 md:col-span-12 lg:col-span-4">
              <InviteFriendUI userData={userData} />
            </div>
            <div className="col-span-12 md:col-span-12 lg:col-span-4">
              <ForumRedirect />
            </div>
          </div>
          </div>
      </div>
    </div>
  );
}

export default CaregiverDash;
