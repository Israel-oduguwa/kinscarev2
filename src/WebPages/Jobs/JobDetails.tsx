import { Interweave } from "interweave";
import { MapPin, MapPinCheckIcon, Send } from "lucide-react";
import Link from "next/link";
import React from "react";
import { polyfill } from "interweave-ssr";
import { Button } from "@/components/ui/button";
import ProviderDialog from "@/Providers/Candidates/ProviderDialog";
import { Separator } from "@/components/ui/separator";
import ProfileAvatar from "@/components/ProfileAvatar";
import OAuthDialog from "@/Authentication/OAuthDialog";
import OauthApply from "./OauthApply";
polyfill();

const SimilarJobs = ({ similarJobs }: any) => {
  console.log(similarJobs);
  return (
    <div className="w-full">
      <p className="text-sm antialiased font-medium">Similar Jobs</p>
      {similarJobs.map((job: any) => (
        <Link href={`/jobs/${job._id}`}>
          <div className="mt-4">
            <div className="border rounded-md border-gray-200 p-4">
              <div className="flex gap-3 mb-3 items-center">
                {job.profileImage && (
                  <img
                    className="h-8 w-8"
                    src={
                      job.profileImage
                        ? job.profileImage
                        : "profileImage:userData?.profileImage,"
                    }
                    alt="company logo"
                  />
                )}
                <div>
                  <p className="text-sm font-medium mb-1">{job.title}</p>
                  <p className="text-xs font-normal">
                    {job.contacts.zipcode}, {job.contacts.city}
                  </p>
                </div>
              </div>
              <div className="w-full flex-wrap gap-4 flex">
                {job.licenses
                  .slice(0, 2)
                  .map((license: any, index: React.Key | null | undefined) => (
                    <div
                      key={index}
                      className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                    >
                      <span className="text-xs antialiased text-gray-600">
                        {license}
                      </span>
                    </div>
                  ))}
                {job.schedule
                  .slice(0, 2)
                  .map((sch: any, index: React.Key | null | undefined) => (
                    <div
                      key={index}
                      className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                    >
                      <span className="text-xs antialiased text-gray-600">
                        {sch}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

async function JobDetails({ jobID }: { jobID: string }) {
  let data = await fetch(
    `https://api.kinscare.org/api/v1/caregivers/job/${jobID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  const { job, similarJobs } = response;
  return (
    <div>
      <div className="max-w-6xl py-20 mx-auto p-4">
        {/* Grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column (Wider on larger screens, full-width on small screens) */}
          <div className="lg:col-span-2 w-full">
            {/* <ShowContactsCard job={job} /> */}
            {/* Add your job details or content here */}
            <div className="w-full mb-4">
              <div className="flex gap-4  flex-wrap items-center lg:flex-nowrap justify-between">
                <h2 className="text-2xl tracking-tight antialiased font-semibold">
                  {job.title}
                </h2>
                <div>
                  <OauthApply jobID={job._id}>
                    <Button>Apply Now</Button>
                  </OauthApply>
                </div>
              </div>
            </div>
            <div className="mb-10">
              <div className="flex items-center">
                {job.profileImage && (
                  <img
                    className="h-8 w-8"
                    src={
                      job.profileImage
                        ? job.profileImage
                        : "profileImage:userData?.profileImage,"
                    }
                    alt="company logo"
                  />
                )}
                <div>
                  <div className="flex gap-2 mb-3">
                    <p className="text-sm text-blue-600 font-medium antialiased">
                      {job.provider}
                    </p>
                    <p className="flex  text-xs antialiased items-center">
                      <MapPinCheckIcon size={16} /> {job.contacts.city}
                    </p>
                  </div>
                  <div className="w-full flex-wrap gap-4 flex">
                    {/* Display only the first 2 licenses */}
                    {job.licenses
                      .slice(0, 3)
                      .map(
                        (license: any, index: React.Key | null | undefined) => (
                          <div
                            key={index}
                            className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                          >
                            <span className="text-xs antialiased text-gray-600">
                              {license}
                            </span>
                          </div>
                        )
                      )}

                    {/* Display only the first 2 schedules */}
                    {job.schedule
                      .slice(0, 3)
                      .map((sch: any, index: React.Key | null | undefined) => (
                        <div
                          key={index}
                          className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                        >
                          <span className="text-xs antialiased text-gray-600">
                            {sch}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-900 ">
                About this role
              </p>
              <div className="w-full text-sm prose-p:text-sm text-gray-600 mb-4">
                <Interweave content={job.description} />
              </div>
              {/* <p className="text-sm font-bold mb-2 antialiased">Certification</p> */}
              <div className="text-sm  prose-p:text-sm text-gray-600 mb-4">
                <Interweave content={job.certifications} />
              </div>
              <div className="mb-4">
                <p className="text-sm font-normal antialiased">
                  {job.mobility}
                </p>
              </div>
              <div className="mb-4">
                <p className="w-full text-sm font-semibold mb-2 text-gray-900">
                  Compensation
                </p>
                <p className="text-sm font-normal antialiased">
                  {job.compensation}
                </p>
              </div>
            </div>
            {job.alert_preferences && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2 text-gray-900">
                  Alert Preferences
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.alert_preferences.map((alert: string, idx: number) => (
                    <div
                      className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                      key={idx}
                    >
                      <span className="text-xs antialiased text-gray-600">
                        {alert}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Right Column (Narrower on larger screens, full-width below) */}
          <div className="">
            {/* Add your sidebar or related jobs content here */}
            <SimilarJobs similarJobs={similarJobs} />
            {/* <p>Other Jobs from {job.provider}</p> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
