"use client";
import React, { useEffect, useState } from "react";
import MongoContext from "@/app/MongoContext";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { Interweave } from "interweave";
import Link from "next/link";
import axios from "axios";
import JobSearchHeader from "./JobSearchHeader";
import { JobCardSkeleton } from "./JobCardSkelenton";
import ApplyNow from "./JobsUI/ApplyNow";
import TagManager from "react-gtm-module";
import JobListingLogo from "@/components/JobListingLogo";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
    {children}
  </span>
);

const JobPostCard: React.FC<{ job: any }> = ({ job }) => {
  // console.log(job);
  const locationLine = [
    job?.contacts?.address ?? "",
    job?.contacts?.city ?? "",
    job?.contacts?.zipcode ?? "",
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <>
      <div
        className="group relative w-full mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md focus-within:shadow-md"
        role="article"
      >
        <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 ring-2 ring-blue-500/0 transition group-hover:opacity-100 group-hover:ring-blue-500/10" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <Link
            href={`/jobs/${job._id}`}
            className="flex flex-1 items-start gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
          >
            <JobListingLogo
              src={job?.profileImage || undefined} // pass ONLY the real URL; no random fallback
              alt={job?.title || job?.employer_name || "Job"}
              seed={job?.employer_name || job?.title || job?._id} // deterministic gradient
              size={40}
              rounded="full" // use "full" for a perfect circle like Vercel
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

          {/* Apply Button */}
          <div className="flex-shrink-0 w-full lg:w-auto ">
            <ApplyNow
              providerName={job.provider}
              job={job}
              jobID={job._id}
              className="w-full lg:w-auto px-6 py-3 bg-blue-600 text-white text-sm rounded-lg shadow-md hover:bg-blue-700 transition-all"
            />
          </div>
        </div>
      </div>
    </>
  );
};

interface Contact {
  address: string;
  city: string;
  zipcode: string;
}

interface Job {
  provider: any;
  profileImage: string; // image url
  _id: any;
  title: string;
  contacts: Contact;
  certifications: string;
  licenses: string[];
  schedule: string[];
  minHours: number;
  compensation: string;
}

interface JobsApiResponse {
  pagination: any;
  totalJobs: number;
  totalPages: number;
  currentPage: number;
  jobs: Job[];
}

const fetchJobs = async (
  userId: string,
  page: number
): Promise<JobsApiResponse> => {
  const response = await fetch(
    `https://kinscare-backend.onrender.com/api/v1/caregivers/jobs/${userId}?page=${page}`
  );
  if (!response.ok) {
    throw new Error("Error fetching jobs");
  }
  return response.json();
};

const fetchFilteredJobs = async (
  userId: string,
  page: number,
  filters: any,
  geoCode: any
): Promise<JobsApiResponse> => {
  const response = await axios.post(
    "https://kinscare-backend.onrender.com/api/v1/caregivers/jobs/filter",
    {
      userID: userId,
      page,
      geoCode,
      filters,
    }
  );
  console.log(response.data);
  return response.data;
};

function All() {
  const mongodb = useContext(MongoContext);
  const { userData }: any = mongodb;
  const { userID } = userData || {};
  const { push } = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    schedule: [] as string[],
    licenses: [] as string[],
    minHours: 8,
  });
  // console.log(userData);
  const loadJobs = async (applyFilters = false) => {
    setLoading(true);
    //  console.log("loading, stems")
    try {
      const data = await fetchJobs(userID, page);
      console.log(data, "s");

      setJobs((prevJobs) =>
        page === 1 ? data.jobs : [...prevJobs, ...data.jobs]
      );
      setTotalPages(data.totalPages);
      setTotalJobs(data.totalJobs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadJobs();
  }, [page]);

  const applyFilters = async () => {
    try {
      setLoading(true);
      const geoCode = userData.geocode_address;
      const job = await fetchFilteredJobs(userID, page, filters, geoCode);
      const tagManagerArgs = {
        dataLayer: {
          event: `search_jobs`,
          settings: userData?.settings,
          filters,
          lname: userData?.lname,
          fname: userData?.fname,
          tel: userData?.auth?.tel,
          zipcode: userData?.zipcode,
          city: userData?.city,
          email: userData?.auth?.email,
        },
      };
      TagManager.dataLayer(tagManagerArgs);
      setTotalPages(job.pagination.totalPages);
      setTotalJobs(job.pagination.totalJobs);
      setJobs(job.jobs);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  // console.log(totalJobs);
  return (
    <div className="py-6 px-2 bg-gray-100 md:px-4 min-h-[100vh]">
      <div className="max-w-6xl mx-auto">
        {/* Job Search Header */}
        <JobSearchHeader
          filters={filters}
          setFilters={setFilters}
          handleSearch={applyFilters}
          loading={loading}
        />

        {/* Job Listings */}
        <div>
          {loading && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1  gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <JobCardSkeleton key={idx} />
                ))}
              </div>
            </div>
          )}
          {!loading && totalJobs > 0 && (
            <div className="mb-4">
              <p className="font-medium text-gray-800">
                Found {totalJobs} job(s) matching your criteria.
              </p>
            </div>
          )}
          {!loading &&
            jobs.map((job: any) => <JobPostCard key={job._id} job={job} />)}
          <div className="flex justify-center mt-4">
            {!loading && page < totalPages && (
              <Button
                onClick={() => setPage((prevPage) => prevPage + 1)}
                
                disabled={loading}
              >
                Load More
              </Button>
            )}
            {page >= totalPages && !loading && <p>No more jobs available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default All;
