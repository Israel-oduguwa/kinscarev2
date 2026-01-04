"use client";

import { useEffect, useState } from "react";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import JobPostActions from "./JobPostActions";
import MatchingCaregiver from "./MatchingCaregiver";
import ProfileImage from "../User/ProfileImage";
import Link from "next/link";
import VerifyNudge from "./VerifyNudge";
import { useApiClient } from "@/hooks/useApiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

polyfill();

interface JobProps {
  jobID: string;
}

interface JobData {
  job: any;
  similarJobs: any[];
}

export default function CaregiverJob({ jobID }: JobProps) {
  const { privateApi } = useApiClient();
  const [data, setData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await privateApi.get(`/api/v1/caregivers/job/${jobID}`);
        const result = response.data;

        if (!result.job) {
          throw new Error("Job not found");
        }

        setData(result);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load job. Please try again.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (jobID) fetchJob();
  }, [jobID, privateApi]);

  if (loading) {
    return <CaregiverJobSkeleton />;
  }

  if (error || !data?.job) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6 text-center">
        <p className="text-red-600 font-medium">{error || "Job not found"}</p>
      </div>
    );
  }

  const { job, similarJobs } = data;

  return (
    <div className="max-w-7xl py-8 px-6 min-h-[100vh] 2xl:px-0 mx-auto">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Job posting
        </p>
      </div>
      <div className="relative shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] border border-white/70 bg-white/80 backdrop-blur mb-4 rounded-3xl p-6">
        {/* Header */}
        <div className="w-full mb-4">
          <div className="flex gap-4 flex-wrap items-center lg:flex-nowrap justify-between">
            <h2 className="text-3xl text-slate-900 tracking-tight font-[family:var(--header-font)] font-extrabold flex items-center gap-3">
              {job.title}
              {job?.verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck size={21} />
                  Verified
                </span>
              )}
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
          <div className="flex space-x-4 items-start">
            <ProfileImage className="w-20 h-20" />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-1 items-center">
                <p className="text-sm font-medium text-slate-900">
                  {job.provider}
                </p>
                <p className="flex gap-1 text-sm items-center text-slate-600">
                  <MapPin size={14} />
                  {job.contacts.address && `${job.contacts.address}, `}
                  {job.contacts.city}, {job.contacts.zipcode}
                </p>
              </div>

              {!job?.verified && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                  <AlertTriangle size={14} className="shrink-0" />
                  Unverified employer
                </p>
              )}

              {job.mobility && (
                <p className="mt-3 w-28 font-bold text-xs bg-emerald-100 text-emerald-700 px-2 rounded-lg py-1">
                  {job.mobility === "car_needed"
                    ? "Car Needed"
                    : "Car not needed"}
                </p>
              )}

              <div className="w-full flex-wrap gap-2 flex mt-3">
                {job?.licenses?.slice(0, 3).map((license: string, index: number) => (
                  <div
                    key={index}
                    className="text-xs bg-white/80 border border-white/70 text-slate-700 rounded-full py-1 px-3 shadow-sm"
                  >
                    <span className="text-xs antialiased">{license}</span>
                  </div>
                ))}

                {job?.schedule?.slice(0, 3).map((sch: string, index: number) => (
                  <div
                    key={index}
                    className="text-xs bg-white/80 border border-white/70 text-slate-700 rounded-full py-1 px-3 shadow-sm"
                  >
                    <span className="text-xs antialiased">{sch}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About / details */}
        <div className="mb-4">
          <p className="font-semibold text-slate-900 mb-1">About this role</p>
          <div className="w-full prose-lg prose-p:text-sm prose-p:mt-1 text-slate-700">
            <Interweave content={job.description} />
          </div>

          <div className="mb-4">
            <p className="font-semibold text-slate-900 mb-1">
              Minimum Hours Required
            </p>
            <p className="text-sm font-normal antialiased text-slate-700">
              {job.minHours} hrs
            </p>
          </div>

          <div className="mb-4">
            <p className="w-full font-semibold text-slate-900 mb-1">
              Compensation
            </p>
            <p className="text-sm font-normal antialiased text-slate-700">
              {job.compensation}
            </p>
          </div>
        </div>

        {job.alert_preferences && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2 text-slate-900">
              Alert Preferences
            </p>
            <div className="flex flex-wrap gap-2">
              {job.alert_preferences.map((alert: string, idx: number) => (
                <div
                  key={idx}
                  className="text-xs bg-white/80 border border-white/70 text-slate-700 rounded-full py-1 px-3 shadow-sm"
                >
                  <span className="text-xs antialiased">{alert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Applicants */}
      {job?.applicants?.length > 0 && (
        <div className="bg-white/80 border border-white/70 my-6 rounded-3xl shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur p-6 overflow-hidden">
          <h3 className="text-2xl font-[family:var(--header-font)] font-extrabold text-slate-900 mb-4">
            Applications for this job
          </h3>
          <ul className="space-y-4">
            {job.applicants.map((app: any) => (
              <Link key={app.userID} href={`/provider/candidates/${app.userID}`}>
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/80 border border-white/70 p-4 rounded-2xl shadow-sm hover:shadow-md transition">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {app.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Applied on:{" "}
                      {new Date(app.applied_on).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                    {app.licenses?.map((lic: string) => (
                      <span
                        key={lic}
                        className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100"
                      >
                        {lic}
                      </span>
                    ))}
                    {app.availability?.map((slot: string) => (
                      <span
                        key={slot}
                        className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100"
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

      {/* Trust nudge */}
      {!job?.verified && (
        <div className="mb-8">
          <VerifyNudge />
        </div>
      )}

      {/* Matching caregivers */}
      {Array.isArray(similarJobs) && similarJobs.length > 0 && (
        <div className="w-full mt-4">
          <p className="antialiased font-bold mb-2">
            Review these caregivers that match your job post
          </p>
          <MatchingCaregiver jobID={jobID} />
        </div>
      )}
    </div>
  );
}

// Perfect Skeleton Loader
function CaregiverJobSkeleton() {
  return (
    <div className="max-w-7xl py-6 px-6 min-h-screen 2xl:px-0 mx-auto space-y-6">
      <div className="shadow-sm border bg-white border-gray-200 rounded-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Provider */}
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2 flex-wrap">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Applicants Skeleton */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
