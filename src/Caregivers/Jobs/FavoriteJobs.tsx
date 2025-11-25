/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/hooks/useApiClient";
import { Interweave } from "interweave";
import { BadgeCheck, ChevronLeft, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { JobCardSkeleton } from "./JobCardSkeleton";
import ApplyNow from "./JobsUI/ApplyNow";
import JobListingLogo from "@/components/JobListingLogo";

interface Contact {
  address: string;
  city: string;
  zipcode: string;
}

interface Job {
  provider: any;
  profileImage: string;
  _id: any;
  title: string;
  contacts: Contact;
  certifications: string;
  licenses: string[];
  schedule: string[];
  minHours: number;
  compensation: string;
}

/** ---------- Small UI bits (unchanged) ---------- **/
const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
    {children}
  </span>
);

const JobPostCard: React.FC<{ job: Job }> = ({ job }:any) => {
  // console.log(job);
  const locationLine = [
    job?.contacts?.address ?? "",
    job?.contacts?.city ?? "",
    job?.contacts?.zipcode ?? "",
  ]
    .filter(Boolean)
    .join(", ");
  return (
       <div
      className="group relative w-full mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md focus-within:shadow-md"
      role="article"
    >
      <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 ring-2 ring-blue-500/0 transition group-hover:opacity-100 group-hover:ring-blue-500/10" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <Link
          href={`/vitae/jobs/${job._id}`}
          className="flex flex-1 items-start gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
        >
          <JobListingLogo
            src={job?.profileImage || undefined}
            alt={job?.title || job?.employer_name || "Job"}
            seed={job?.employer_name || job?.title || job?._id}
            size={40}
            rounded="full"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                {job?.title}
              </h2>
              {Array.isArray(job?.licenses) && job.licenses.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {job.licenses[0]}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{locationLine || "—"}</span>
            </div>

            {job.certifications && job.certifications.length > 0 && (
              <div className="mt-3 text-sm text-gray-700 line-clamp-2">
                <Interweave content={job?.certifications ?? ""} />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {Array.isArray(job?.licenses) &&
                job.licenses.map((license: string, i: number) => (
                  <Chip key={`lic-${i}`}>{license}</Chip>
                ))}
              {Array.isArray(job?.schedule) &&
                job.schedule.map((sch: string, i: number) => (
                  <Chip key={`sch-${i}`}>
                    <Clock className="h-3.5 w-3.5" />
                    {sch}
                  </Chip>
                ))}
              <Chip>
                Min Hours:{" "}
                <span className="ml-1 font-semibold">
                  {job?.minHours ?? "—"} / wk
                </span>
              </Chip>
            </div>
          </div>
        </Link>

        <div className="shrink-0 w-full lg:w-auto">
          <ApplyNow job={job} jobID={job._id} />
        </div>
      </div>
    </div>
  );
};

function FavoriteJobs() {
  const authData: any = useAuthContext();
  const {contactData } = authData;
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const { privateApi } = useApiClient();
  
  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data }: any = await privateApi.get(
        `/api/v1/caregivers/jobs/favorite/${contactData.userID}`
      );
      setJobs(data.jobs);
      setTotalJobs(data.totalJobs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
      fetchJob();
  }, [contactData]);
  // console.log(jobs);
  return (
    <div className="py-6 px-2 bg-gray-100 md:px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="div">
          <Link href="/vitae/jobs/all">
            <Button variant="ghost">
              <ChevronLeft size={18} /> Back to search jobs
            </Button>
          </Link>
        </div>
        {!loading && totalJobs > 0 && (
          <div className="mb-4">
            <p className="font-medium text-gray-800">No favorite job</p>
          </div>
        )}
        {loading && (
          <div>
            <div className="grid grid-cols-1  gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <JobCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        )}
        {!loading && (
          <>
            {jobs.map((job: any, index: React.Key | null | undefined) => (
              <JobPostCard key={index} job={job} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default FavoriteJobs;
