import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { MapPin, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import React from "react";
import JobPostActions from "./JobPostActions";
import MatchingCaregiver from "./MatchingCaregiver";
import ProfileImage from "../User/ProfileImage";
import Link from "next/link";
import VerifyNudge from "./VerifyNudge";

polyfill();

interface JobProps {
  jobID: string;
}

async function CaregiverJob({ jobID }: JobProps) {
  const data = await fetch(
    `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/caregivers/job/${jobID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  const { job, similarJobs } = response;

  return (
    <div>
      <div className="max-w-6xl py-6 px-6 min-h-[100vh] 2xl:px-0 mx-auto">
        <div className="relative shadow-sm border bg-white border-gray-200 mb-4 rounded-lg p-6">
          {/* Header */}
          <div className="w-full mb-4">
            <div className="flex gap-4 flex-wrap items-center lg:flex-nowrap justify-between">
              <h2 className="text-3xl text-gray-800 tracking-tight font-semibold flex items-center gap-3">
                {job.title}
                {/* Verified pill only if verified */}
                {job?.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <ShieldCheck size={21} />
                    Verified
                  </span>
                )}
                {/* ⚠️ icon on title when NOT verified */}
                {!job?.verified && (
                  <ShieldAlert  
                    size={26}
                    className="text-red-600"
                    aria-label="Unverified employer"
                  />
                )}
              </h2>
              <div>
                <JobPostActions jobID={jobID} />
              </div>
            </div>
          </div>

          {/* Provider / job meta */}
          <div className="mb-10">
            <div className="flex space-x-2 items-center">
              <ProfileImage className="w-20 h-20" />
              <div>
                <div className="flex gap-2 mb-1 items-center">
                  <p className="text-sm font-medium ">{job.provider}</p>
                  <p className="flex gap-1 text-sm items-center text-gray-700">
                    <MapPin size={14} />
                    {job.contacts.address && job.contacts.address}{" "}
                    {job.contacts.city}, {job.contacts.zipcode}
                  </p>
                </div>

                {/* "Unverified employer" note under the employer name when NOT verified */}
                {!job?.verified && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                    <AlertTriangle size={14} className="shrink-0" />
                    Unverified employer
                  </p>
                )}

                {job.mobility && (
                  <p className="mt-3 w-28 font-bold text-xs bg-green-100 text-green-600 px-2 rounded-lg py-1">
                    {job.mobility === "car_needed"
                      ? "Car Needed"
                      : "Car not needed"}
                  </p>
                )}

                <div className="w-full flex-wrap gap-4 flex mt-3">
                  {job?.licenses
                    ?.slice(0, 3)
                    .map((license: any, index: React.Key) => (
                      <div
                        key={index}
                        className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                      >
                        <span className="text-xs antialiased text-gray-600">
                          {license}
                        </span>
                      </div>
                    ))}

                  {job?.schedule
                    ?.slice(0, 3)
                    .map((sch: any, index: React.Key) => (
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

          {/* About / details */}
          <div className="mb-4">
            <p className="font-semibold mb-1">About this role</p>
            <div className="w-full prose-lg prose-p:text-sm prose-p:mt-1 text-gray-700">
              <Interweave content={job.description} />
            </div>

            <div className="mb-4">
              <p className="font-semibold mb-1">Minimum Hours Required</p>
              <p className="text-sm font-normal antialiased">
                {job.minHours} hrs
              </p>
            </div>

            <div className="mb-4">
              <p className="w-full font-semibold mb-1">Compensation</p>
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

        {/* Applicants */}
        {job?.applicants?.length > 0 && (
          <div className="bg-white my-6 rounded-3xl shadow-lg p-6 overflow-hidden">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Applications for this job
            </h3>
            <ul className="space-y-4">
              {job.applicants.map((app: any) => (
                <Link
                  key={app.userID}
                  href={`/provider/candidates/${app.userID}`}
                >
                  <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {app.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Applied on:{" "}
                        {new Date(app.applied_on).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                      {app.licenses?.map((lic: any) => (
                        <span
                          key={lic}
                          className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full"
                        >
                          {lic}
                        </span>
                      ))}
                      {app.availability?.map((slot: any) => (
                        <span
                          key={slot}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        )}

        {/* Trust nudge (only when NOT verified) */}
        {!job?.verified && (
          <div className="mb-8">
            <VerifyNudge />
          </div>
        )}

        {/* Matching caregivers */}
        {MatchingCaregiver.length > 1 && (
          <div className="w-full mt-4">
            <p className="antialiased font-bold mb-2">
              Review these caregivers that match your job post
            </p>
            <MatchingCaregiver jobID={jobID} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CaregiverJob;
