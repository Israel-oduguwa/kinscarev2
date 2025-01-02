import { Interweave } from "interweave";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import OauthApply from "./OauthApply";

const JobPostCard: React.FC<{ job: any }> = ({ job }) => {
  console.log(job);
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 my-4 w-full mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <Link href={`/jobs/${job._id}`} className="flex-1">
          {/* Header Section */}
          <div className="flex gap-4 items-center mb-4">
            {job.profileImage && (
              <img
                className="h-12 w-12 rounded-full object-cover"
                src={
                  job.profileImage ||
                  "https://lh3.googleusercontent.com/-g8IwNe70-kE/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkl1tpVAKXAezzCNWmKH5JWvlgr_xw/photo.jpg?sz=46"
                }
                alt="company logo"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {job.title}
              </h2>
              <p className="text-sm text-gray-600">
                {job.contacts.address}, {job.contacts.city},{" "}
                {job.contacts.zipcode}
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              <Interweave content={job.certifications} />
            </p>
          </div>

          {/* Licenses and Schedule */}
          <div className="flex flex-wrap gap-3 mb-4">
            {job.licenses.map((license: string, index: number) => (
              <div
                key={index}
                className="text-sm bg-gray-100 text-gray-800 rounded-lg py-1 px-3"
              >
                {license}
              </div>
            ))}
            {job.schedule.map((sch: string, index: number) => (
              <div
                key={index}
                className="text-sm bg-gray-100 text-gray-800 rounded-lg py-1 px-3"
              >
                {sch}
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-6">
            <p className="text-sm text-gray-600">
              Min Hours:{" "}
              <span className="font-medium">{job.minHours} hours/week</span>
            </p>
          </div>
        </Link>

        {/* Apply Button Section */}
        <div className="flex-shrink-0 w-full lg:w-auto self-center lg:self-start">
          <OauthApply jobID={job._id}>
            <Button className="w-full lg:w-auto px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
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
}: {
  schedule: string;
  licenses: string;
}) {
  let data = null;
  if (schedule) {
    data = await fetch(
      `https://api.kinscare.org/api/v1/caregivers/jobs-search?schedule=${schedule}&licenses=${licenses}&page=1&limit=10`,
      { cache: "no-cache" }
    );
  } else {
    data = await fetch(
      `https://api.kinscare.org/api/v1/caregivers/jobs-search`,
      { cache: "no-cache" }
    );
  }
  const response = await data.json();
  console.log(response);
  const {
    jobs,
    success,
    pagination: { totalJobs, totalPages, currentPage, limit },
  } = response;
  const handleLoad = () => {};
  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Job Search Header */}
        <div className="mb-8">
          <SearchBar />
          <h1 className="text-lg font-semibold text-gray-800 mt-6">
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

        {/* Load More Button */}
        {currentPage < totalPages && (
          <div className="mt-8 flex justify-center">
            <Link
              href={`/find-jobs?schedule=${schedule}&licenses=${licenses}`}
              className="inline-block"
            >
              <Button className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg">
                Load More
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default All;
