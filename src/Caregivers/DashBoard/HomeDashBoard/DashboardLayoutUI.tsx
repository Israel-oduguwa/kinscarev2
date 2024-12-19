import React from "react";
import RecommendedJobs from "./RecommendedJobs";
import ForumRedirect from "../Charts/DashBoardHomePage/ForumRedirect";
import Leaderboard from "../Charts/DashBoardHomePage/LeaderBoard";

function DashboardLayoutUI() {
  return (
    <div className="px-2 bg-gray-50 md:px-4 min-h-[100vh] ">
      <div className="max-w-6xl mx-auto px-0 md:px-4 py-5 md:py-10">
        <div className="flex flex-col space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-8 md:col-span-12">
              <RecommendedJobs />
            </div>
            <div className="col-span-12 lg:col-span-4 md:col-span-12">
              <div className="mb-10">
                <Leaderboard />
              </div>
              <div>
                {" "}
                <ForumRedirect />{" "}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 md:col-span-12">
              <div className="mb-10">
               <div>
                <h2 className="font-semibold text-xl tracking-tight antialiased ">Your Applications</h2>
               </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayoutUI;
