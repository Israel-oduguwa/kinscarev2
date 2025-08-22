import React from "react";
import ApplyNow from "./JobsUI/ApplyNow";
import { MapPin, ShieldCheck, ShieldAlert } from "lucide-react";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import Link from "next/link";
import Image from "next/image";
polyfill();

interface JobProps {
  jobID: string;
}

const VerifiedPill = ({ verified }: { verified?: boolean }) => {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm">
      <ShieldCheck size={14} className="shrink-0" />
      Verified
    </span>
  );
};

const VerificationCard = ({ verified }: { verified?: boolean }) => {
  const Icon = verified ? ShieldCheck : ShieldAlert;
  const label = verified ? "Verified" : "Unverified";
  const message = verified
    ? "Identity verified—trusted by caregivers."
    : "You still need to verify—here’s why and how.";
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ring-1 ${
        verified
          ? "border-emerald-200 ring-emerald-100/60 bg-gradient-to-b from-white to-emerald-50"
          : "border-amber-200 ring-amber-100/60 bg-gradient-to-b from-white to-amber-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            verified ? "bg-emerald-100" : "bg-amber-100"
          }`}
        >
          <Icon size={20} className={verified ? "text-emerald-700" : "text-amber-700"} />
        </div>
        <div>
          <p className="text-base font-semibold tracking-tight text-gray-900">
            {label}
          </p>
          <p className="mt-1 text-sm leading-5 text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

const SimilarJobs = ({ similarJobs }: any) => {
  return (
    <div className="w-full">
      <p className="text-sm antialiased font-medium">Similar Jobs</p>
      {similarJobs.map((job: any) => (
        <Link key={job._id} href={`/vitae/jobs/${job._id}`}>
          <div className="mt-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-center gap-3">
                {job.profileImage && (
                  <Image
                    width={40}
                    height={40}
                    className="h-8 w-8 rounded-md object-cover"
                    src={
                      job.profileImage
                        ? job.profileImage
                        : "profileImage:userData?.profileImage,"
                    }
                    alt="company logo"
                  />
                )}
                <div className="min-w-0">
                  <p className="mb-1 line-clamp-1 text-sm font-medium text-gray-900">
                    {job.title}
                  </p>
                  <p className="text-xs font-normal text-gray-600">
                    {job.contacts?.zipcode}, {job.contacts?.city}
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2">
                {Array.isArray(job.licenses) &&
                  job.licenses.slice(0, 2).map((license: any, index: React.Key) => (
                    <span
                      key={index}
                      className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                      {license}
                    </span>
                  ))}
                {Array.isArray(job.schedule) &&
                  job.schedule.slice(0, 2).map((sch: any, index: React.Key) => (
                    <span
                      key={index}
                      className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                      {sch}
                    </span>
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
  const data = await fetch(
    `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/caregivers/job/${jobID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  const { job, similarJobs } = response;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-6 2xl:px-0">
      <div className="mx-auto max-w-6xl">
        {/* Grid container */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                {job.title}
              </h2>

              <div className="flex items-center gap-3">
                {/* Shows only when verified === true */}
                <VerifiedPill verified={job?.verified} />
                <ApplyNow job={job} jobID={jobID} />
              </div>
            </div>

            {/* Job Details */}
            <div className="mb-6 flex items-start gap-4">
              {job.profileImage && (
                <Image
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                  src={job.profileImage || "profileImage:userData?.profileImage"}
                  alt="company logo"
                />
              )}
              <div className="mb-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-blue-600">
                    {job.provider}
                  </p>
                </div>
                <p className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                  <MapPin size={20} />
                  {job.contacts?.city}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job?.licenses?.slice(0, 3).map((license: any, index: any) => (
                    <span
                      key={index}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-800"
                    >
                      {license}
                    </span>
                  ))}
                  {job?.schedule?.slice(0, 3).map((sch: any, index: any) => (
                    <span
                      key={index}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-800"
                    >
                      {sch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold tracking-tight text-gray-900">
                About this Role
              </h3>
              <div className="prose-sm mb-4 leading-relaxed text-gray-700">
                <Interweave content={job.description} />
              </div>
              {job.certifications && (
                <div className="prose-sm mb-4 leading-relaxed text-gray-700">
                  <Interweave content={job.certifications} />
                </div>
              )}
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
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Compensation
              </h3>
              <p className="text-sm text-gray-700">{job.compensation}</p>
            </div>

            {/* Alert Preferences */}
            {job.alert_preferences && (
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Alert Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.alert_preferences.map((alert: any, idx: any) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-800"
                    >
                      {alert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Verification status (inspired by your image) */}
            {/* add it later and update the ui   */}
            {/* <VerificationCard verified={job?.verified} /> */}

            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Similar Jobs
              </h3>
              <SimilarJobs similarJobs={similarJobs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaregiverJob;
