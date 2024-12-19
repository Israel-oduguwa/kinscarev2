import { Interweave } from "interweave";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import OauthApply from "./OauthApply";

const JobPostCard: React.FC<{ job: any }> = ({ job }) => {
  console.log(job);
  return (
    <div className="bg-white shadow-sm relative border-gray-50 border rounded-lg p-6 my-4 w-full mx-auto">
      <Link href={`/jobs/${job._id}`}>
        <div className="flex gap-2 items-center mb-3">
          {/* add the verification badge is the user is verified  */}
          {job.profileImage && (
            <img
              className="h-10 w-10"
              src={
                job.profileImage
                  ? job.profileImage
                  : "https://lh3.googleusercontent.com/-g8IwNe70-kE/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkl1tpVAKXAezzCNWmKH5JWvlgr_xw/photo.jpg?sz=46"
              }
              alt="company logo"
            />
          )}

          <div className="lg:max-w-lg xl:max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
            <p className="text-sm text-gray-600">
              {job.contacts.address}, {job.contacts.city},{" "}
              {job.contacts.zipcode}
            </p>
          </div>
        </div>
        <div className="w-full mb-3">
          <div className="text-sm text-gray-600 line-clamp-2">
            <Interweave content={job.certifications} />
          </div>
        </div>
        <div className="w-full flex-wrap gap-4 flex mb-3">
          {job.licenses.map((license: string, index: number) => (
            <div
              key={index}
              className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
            >
              <span className="text-sm text-gray-600">{license}</span>
            </div>
          ))}
          {job.schedule.map((sch: string, index: number) => (
            <div
              key={index}
              className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
            >
              <span className="text-sm text-gray-600">{sch}</span>
            </div>
          ))}
        </div>
        <div className="w-full gap-4 items-center flex">
          <p className="text-gray-500 text-sm">
            Min Hours:{" "}
            <span className="text-gray-600">{job.minHours} hours/week</span>
          </p>
          {/* <p className="text-gray-600 flex gap-1 items-center text-sm">
            💵 {job.compensation}
          </p> */}
        </div>
      </Link>
      <div className="absolute hidden lg:block lg:top-6 lg:right-6 ">
        <OauthApply jobID={job._id}>
          <Button>Apply Now</Button>
        </OauthApply>
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
  let data = null
  if (schedule) {
     data = await fetch(
      `http://localhost:8081/api/v1/caregivers/jobs-search?schedule=${schedule}&licenses=${licenses}&page=1&limit=10`,
      { cache: "no-cache" }
    );
  } else {
     data = await fetch(
      `http://localhost:8081/api/v1/caregivers/jobs-search`,
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
  const handleLoad  = () =>{

  }
  return (
    <div className="py-20  px-2 bg-gray-100 md:px-4 min-h-[100vh]">
      <div className="max-w-6xl mx-auto">
        {/* Job Search Header */}
        <SearchBar />
        <h1 className="text-md text-gray-800 tracking-tight antialiased font-bold mb-4">
          There are {totalJobs} caregivers near you with {licenses} requirements
        </h1>
        {/* Job Listings */}
        <div>
          {jobs.map((job: any) => (
            <JobPostCard key={job._id} job={job} />
          ))}
        </div>
        {currentPage < totalPages && (
          <Link href={`/find-jobs?schedule=${schedule}&licenses=${licenses}`}>
          <Button  className="mt-4">Load More</Button></Link>
        )}
      </div>
    </div>
  );
}

export default All;
