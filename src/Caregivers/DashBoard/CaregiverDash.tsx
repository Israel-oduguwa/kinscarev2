"use client";
import MongoContext from "@/app/MongoContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, PencilLine } from "lucide-react";
import Link from "next/link";
import React, { useContext } from "react";
import RoundProgress from "./Charts/RoundProgress";
import CoursePlanUi from "./Charts/DashBoardHomePage/CoursePlanUi";
import WorkExperienceUi from "./Charts/DashBoardHomePage/WorkExperienceUi";
import InviteFriendUI from "./Charts/DashBoardHomePage/InviteFriendUI";
import ReferEmployerUI from "./Charts/DashBoardHomePage/ReferEmployerUI";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreBoardUi from "./Charts/DashBoardHomePage/ScoreBoardUi";
import ProfessionProfile from "./Charts/DashBoardHomePage/ProfessionProfile";
import LeaderBoard from "./Charts/DashBoardHomePage/LeaderBoard";
import ForumRedirect from "./Charts/DashBoardHomePage/ForumRedirect";

function CaregiverDash() {
  const mongodb: any = useContext(MongoContext);
  const { user, userData } = mongodb;
  // console.log(userData?.careerProfile);
  return (
    <div className="py-10 px-2 bg-gray-50 md:px-4 min-h-[100vh] ">
      {/* <RoundProgress /> */}
      {/* The dashboard of the applicant when the user signs in the first time, the applicants gets in here  */}
      <div className="max-w-6xl mx-auto">
        <div className="w-full mb-6">
          <div className="flex space-x-2 mb-0.5 items-center">
            <h2 className="text-3xl font-semibold antialiased text-gray-900 flex space-x-2 items-center ">
              Hi,{" "}
              {userData ? (
                `${userData.fname} ${userData.lname}`
              ) : (
                <Skeleton className="h-9 ml-2 w-80 bg-slate-200" />
              )}
            </h2>
          </div>
          <p className="text-slate-500 text-sm">
            Complete these steps to land your next role
          </p>
        </div>
        <div className="flex flex-col space-y-8">
          <div className="grid  grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 md:col-span-12">
              <LeaderBoard/>
            </div>
            <div className="col-span-12 lg:col-span-5 md:col-span-12">
              <ProfessionProfile userData={userData} />
            </div>

           
           
          </div>
          <div className="grid space-x-4 grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 md:col-span-12">
              <ScoreBoardUi userData={userData} />
            </div>
            <div className="col-span-12 lg:col-span-4 md:col-span-12">
              <CoursePlanUi userData={userData} />
            </div>

            <div className="col-span-12 lg:col-span-4 md:col-span-12">
              <WorkExperienceUi userData={userData} />
            </div>

        
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 md:col-span-12">
            <ReferEmployerUI />
            </div>
            <div className="col-span-12 lg:col-span-4 md:col-span-12">
            <InviteFriendUI userData={userData} />
            </div>

            <div className="col-span-12 lg:col-span-4 md:col-span-12">
              <ForumRedirect />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaregiverDash;

// <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto mb-4">
// {/* First and Second Cards: Occupying 7/12 width on large screens */}
// <div className="lg:col-span-3 flex flex-col space-y-4 mb-6">
//   {/* Invite Friend UI */}

//   {/* Refer Employer UI */}
//   {/* <ReferEmployerUI /> */}
//   <div className="flex flex-col space-y-6">
//     {" "}
//     <ScoreBoardUi userData={userData} />
//     {/* Add another UI below it in the first column if needed */}
//     <div className="flex flex-col space-y-1">
//       <ProfessionProfile userData={userData} />

//     </div>
//   </div>
// </div>
// <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-9 gap-4">
//   {/* First Column: Course Plan */}
//   <div className="flex flex-col space-y-6">
//     <CoursePlanUi userData={userData} />
//     <InviteFriendUI userData={userData} />
//   </div>
//   {/* Second Column: Work Experience */}
//   <div className="flex flex-col space-y-6">
//     <WorkExperienceUi userData={userData} />
//     <ReferEmployerUI />
//   </div>
// </div>

// {/* Third Column: Invite Friend and Refer Employer stacked vertically, occupying 5/12 width on large screens */}

// </div>
// <div className="grid grid-cols-1 space-y-2 lg:grid-cols-12 gap-4">
// {/* First Column: 6/12 width */}
// {/* <div className="lg:col-span-4 space-y-3"></div> */}

// {/* Second Column: 6/12 width */}
// <div className="lg:col-span-12">
//   <LeaderBoard userData={userData} />
// </div>
// <div className="lg:col-span-4">
//   <ForumRedirect />
// </div>
// </div>
