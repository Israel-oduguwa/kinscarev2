import React from "react";
import ApplyNow from "./JobsUI/ApplyNow";
import { LocateFixedIcon, LocateIcon, MapPin, MapPinCheckIcon } from "lucide-react";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import Link from "next/link";
polyfill();
interface JobProps {
  jobID: string;
}

const SimilarJobs = ({ similarJobs }: any) => {
  console.log(similarJobs);
  return (
    <div className="w-full">
      <p className="text-sm antialiased font-medium">Similar Jobs</p>
      {similarJobs.map((job: any) => (
        <Link href={`/vitae/jobs/${job._id}`}>
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
async function CaregiverJob({ jobID }: JobProps) {
  let data = await fetch(
    `https://api.kinscare.org/api/v1/caregivers/job/${jobID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  // console.log(response.job);
  const { job, similarJobs } = response;
  console.log(job);
  return (
    <div className="py-6 px-6 2xl:px-0 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="flex flex-wrap lg:flex-nowrap justify-between items-center mb-6 gap-4">
              <h2 className="text-xl md:text-2xl tracking-tight font-bold text-gray-800">
                {job.title}
              </h2>

              <ApplyNow providerName={job.provider} job={job} jobID={jobID} />
            </div>

            {/* Job Details */}
            <div className="flex items-start gap-4 mb-6">
              {job.profileImage && (
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={
                    job.profileImage || "profileImage:userData?.profileImage"
                  }
                  alt="company logo"
                />
              )}
              <div className="flex-1 mb-2">
                <p className="text-sm mb-1 font-medium text-blue-600">
                  {job.provider}
                </p>
                <p className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <MapPin size={20} />
                  {job.contacts.city}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.licenses.slice(0, 3).map((license: any, index: any) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-lg"
                    >
                      {license}
                    </span>
                  ))}
                  {job.schedule.slice(0, 3).map((sch: any, index: any) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-lg"
                    >
                      {sch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <h3 className="font-semibold tracking-tight text-gray-800 mb-2">
                About this Role
              </h3>
              <div className="text-sm prose-sm text-gray-700 leading-relaxed mb-4">
                <Interweave content={job.description} />
              </div>
              <div className="text-sm prose-sm text-gray-700 leading-relaxed mb-4">
                <Interweave content={job.certifications} />
              </div>
            </div>

            {/* Mobility */}
            {job.mobility && (
              <div className="mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Mobility:</strong> {job.mobility}
                </p>
              </div>
            )}

            {/* Compensation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Compensation
              </h3>
              <p className="text-sm text-gray-700">{job.compensation}</p>
            </div>

            {/* Alert Preferences */}
            {job.alert_preferences && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Alert Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.alert_preferences.map((alert: any, idx: any) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-lg"
                    >
                      {alert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Similar Jobs
            </h3>
            <SimilarJobs similarJobs={similarJobs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaregiverJob;
