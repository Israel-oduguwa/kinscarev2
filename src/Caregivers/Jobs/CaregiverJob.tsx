"use client";

import React from "react";
import ApplyNow from "./JobsUI/ApplyNow";
import {
  MapPin,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  Clock,
  Award,
  Users,
  Building2,
} from "lucide-react";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import Link from "next/link";
import Image from "next/image";
import { useApiClient } from "@/hooks/useApiClient";

interface JobProps {
  jobID: string;
}

const VerifiedBadge = ({ verified }: { verified?: boolean }) => {
  if (!verified) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-emerald-600">
      <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 rounded-full">
        <ShieldCheck size={12} />
      </div>
      Verified employer
    </div>
  );
};

const StatPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="text-center p-4">
    <div className="flex justify-center mb-2">
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon size={18} className="text-gray-600" />
      </div>
    </div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

const SimilarJobs = ({ similarJobs }: any) => {
  return (
    <div className="w-full">
      <p className="text-sm antialiased font-semibold">Similar Jobs</p>
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
                    src={job.profileImage}
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
                  job.licenses
                    .slice(0, 2)
                    .map((license: any, idx: React.Key) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {license}
                      </span>
                    ))}
                {Array.isArray(job.schedule) &&
                  job.schedule.slice(0, 2).map((sch: any, idx: React.Key) => (
                    <span
                      key={idx}
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

export default function CaregiverJob({ jobID }: JobProps) {
  const { privateApi } = useApiClient();

  const [job, setJob] = React.useState<any>(null);
  const [similarJobs, setSimilarJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadJob() {
      try {
        const res = await privateApi.get(`/api/v1/caregivers/job/${jobID}`);
        const { job, similarJobs } = res.data;

        setJob(job);
        setSimilarJobs(similarJobs);
      } catch (error) {
        console.error("Error loading job:", error);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobID, privateApi]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-6 2xl:px-0">
      <div className="mx-auto max-w-7xl">
        {/* Grid container */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="border-b border-gray-100">
              <div className="max-w-7xl mx-auto py-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      {job.profileImage && (
                        <Image
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-2xl object-cover"
                          src={job.profileImage}
                          alt="Company logo"
                        />
                      )}
                      <div>
                        <VerifiedBadge verified={job?.verified} />
                        <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-3 leading-tight">
                          {job.title}
                        </h1>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span className="flex items-center gap-2">
                            <Building2 size={18} />
                            {job.provider}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin size={18} />
                            {job.contacts?.city}, {job.contacts?.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden max-w-2xl">
                      {job.compensation && (
                        <StatPill
                          icon={DollarSign}
                          label="Compensation"
                          value={job.compensation}
                        />
                      )}
                      {job.schedule?.[0] && (
                        <StatPill
                          icon={Clock}
                          label="Schedule"
                          value={job.schedule[0]}
                        />
                      )}
                      {job.licenses?.[0] && (
                        <StatPill
                          icon={Award}
                          label="License"
                          value={job.licenses[0]}
                        />
                      )}
                      {job.alert_preferences?.[0] && (
                        <StatPill
                          icon={Users}
                          label="Preference"
                          value={job.alert_preferences[0]}
                        />
                      )}
                    </div>
                  </div>

                  <div className="lg:w-48">
                    <ApplyNow job={job} jobID={jobID} />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="mb-6 flex items-start gap-4">
            
               <div className="mt-3 flex flex-wrap gap-2">
                  {job?.licenses?.slice(0, 3).map((license: any, idx: any) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-800"
                    >
                      {license}
                    </span>
                  ))}
                  {job?.schedule?.slice(0, 3).map((sch: any, idx: any) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-800"
                    >
                      {sch}
                    </span>
                  ))}
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
            <div>
              <SimilarJobs similarJobs={similarJobs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
