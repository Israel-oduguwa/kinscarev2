import { Interweave } from "interweave";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import OauthApply from "./OauthApply";

const JobPostCard: React.FC<{ job: any }> = ({ job }) => {
  // console.log(job);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 my-4 w-full mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Job Info Section */}
        <Link href={`/jobs/${job._id}`} className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            {job.profileImage && (
              <img
                className="h-14 w-14 rounded-full object-cover"
                src={
                  job.profileImage ||
                  "https://lh3.googleusercontent.com/-g8IwNe70-kE/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkl1tpVAKXAezzCNWmKH5JWvlgr_xw/photo.jpg?sz=46"
                }
                alt="company logo"
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                {job.title}
              </h2>
              <p className="text-sm text-gray-600">
                {job.contacts.address}, {job.contacts.city},{" "}
                {job.contacts.zipcode}
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-4">
            <div className="text-sm text-gray-700 line-clamp-2">
              <Interweave content={job.certifications} />
            </div>
          </div>

          {/* Licenses and Schedule Tags */}
          <div className="flex flex-wrap gap-3 mb-4">
            {job?.licenses?.map((license: string, index: number) => (
              <div
                key={index}
                className="text-sm bg-gray-100 text-gray-800 rounded-full px-3 py-1"
              >
                {license}
              </div>
            ))}
            {job?.schedule?.map((sch: string, index: number) => (
              <div
                key={index}
                className="text-sm bg-gray-100 text-gray-800 rounded-full px-3 py-1"
              >
                {sch}
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="flex items-center gap-6">
            <p className="text-sm text-gray-700">
              Min Hours:{" "}
              <span className="font-medium">{job.minHours} hours/week</span>
            </p>
          </div>
        </Link>

        {/* Apply Button */}
        <div className="flex-shrink-0 w-full lg:w-auto self-center lg:self-start">
          <OauthApply job={job} jobID={job._id}>
            <Button className="w-full lg:w-auto px-6 py-3 text-white  rounded-lg">
              Apply Now
            </Button>
          </OauthApply>
        </div>
      </div>
    </div>
  );
};

async function All({
  schedule,
  licenses,
  page,
  minHours,
}: {
  schedule: string;
  licenses: string;
  minHours: string;
  page: number;
}) {
  let data = null;
  if (schedule) {
    data = await fetch(
      `https://api.kinscare.org/api/v1/caregivers/jobs-search?schedule=${schedule}&licenses=${licenses}&minHours=${minHours}&page=${page}&limit=10`,
      { cache: "no-cache" }
    );
  } else {
    data = await fetch(`https://api.kinscare.org/api/v1/caregivers/jobs-search`, {
      cache: "no-cache",
    });
  }
  const response = await data.json();
  // console.log(response);
  const {
    jobs,
    success,
    pagination: { totalJobs, totalPages, currentPage, limit },
  } = response;
  const handleLoad = () => {};
  console.log(currentPage, "current");
  return (
    <div className="py-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Job Search Header */}
        <div className="mb-8">
          <SearchBar />
          <h1 className="text-lg tracking-tight font-semibold text-gray-700 mt-6">
            There are <span className="text-blue-600">{totalJobs}</span>{" "}
            caregivers near you with
            <span className="text-blue-700"> {licenses} </span> requirements
          </h1>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {jobs.map((job: any) => (
            <JobPostCard key={job._id} job={job} />
          ))}
        </div>
        {/* Pagination Section */}
        <div className="mt-8 flex justify-between items-center">
          {/* Go Back Button */}
          {currentPage > 1 ? (
            <Link
              href={`/find-jobs?schedule=${schedule}&licenses=${licenses}&minHours=${minHours}&page=${
                currentPage - 1
              }`}
              className="px-6 py-3 text-sm text-white bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md transition"
            >
              Previous
            </Link>
          ) : (
            <button
              className="px-6 py-3 text-sm text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
              disabled
            >
              Previous
            </button>
          )}

          {/* Current Page Indicator */}
          <div className="text-sm text-gray-800 dark:text-white font-medium">
            Page <span className="font-bold">{currentPage}</span> of{" "}
            <span className="font-bold">{totalPages}</span>
          </div>

          {/* Next Page Button */}
          {currentPage < totalPages ? (
            <Link
              href={`/find-jobs?schedule=${schedule}&licenses=${licenses}&minHours=${minHours}&page=${
                currentPage + 1
              }`}
              className="px-6 py-3 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
            >
              Next
            </Link>
          ) : (
            <button
              className="px-6 py-3 text-sm text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
              disabled
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default All;
