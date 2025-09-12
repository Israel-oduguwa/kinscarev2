"use client"
import React, { useContext } from "react";
import OauthApply from "./OauthApply";
import SigninModal from "@/Authentication/SiginModal";
import MongoContext from "@/app/MongoContext";

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
    {children}
  </span>
);

function SearchInfo({ jobs, totalJobs, filters }: any) {
  const { userData }: any = useContext(MongoContext);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className=" font-semibold tracking-tight text-gray-800">
          <span className="text-gray-600">There are</span>{" "}
          <span className="text-blue-600">{totalJobs}</span>{" "}
          <span className="text-gray-600">jobs near you.</span>
          {jobs.length > 0 ? (
            <>
              {!userData && (
                <>
                  <OauthApply job={jobs[0]} jobID={jobs[0]?._id}>
                    <span className="cursor-pointer font-semibold text-blue-600 underline-offset-4 hover:underline">
                      Register
                    </span>
                  </OauthApply>{" "}
                  <span className="text-gray-600">or</span>{" "}
                  <SigninModal role="caregiver">
                    <span className="cursor-pointer text-blue-600 underline-offset-4 hover:underline">
                      sign in
                    </span>
                  </SigninModal>{" "}
                  <span className="text-gray-600">
                    to view details and apply instantly.
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="text-gray-600">
              Adjust your filters to discover more opportunities.
            </span>
          )}
        </h1>

        {/* Active filters (visual summary) */}
        <div className="flex flex-wrap items-center gap-2">
          {filters?.schedule ? <Chip>Schedule: {filters.schedule}</Chip> : null}
          {filters?.licenses ? <Chip>License: {filters.licenses}</Chip> : null}
          {filters?.minHours ? (
            <Chip>Min Hours: {filters.minHours}</Chip>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default SearchInfo;
