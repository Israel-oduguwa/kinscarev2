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

const JobPostCard: React.FC<{ job: Job }> = ({ job }) => {
  // console.log(job);
  return (
    <div className="bg-white shadow-md border border-gray-100 rounded-lg p-6 my-4 w-full mx-auto">
      <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-6">
        {/* Job Content */}
        <Link href={`/vitae/jobs/${job._id}`} className="flex-1">
          <div>
            {/* Job Header */}
            <div className="flex items-center gap-4 mb-4">
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
                <h2 className="font-bold tracking-tight text-gray-800">
                  {job.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {job.contacts.address}, {job.contacts.city},{" "}
                  {job.contacts.zipcode}
                </p>
              </div>
            </div>

            {/* Certifications */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                <Interweave content={job.certifications} />
              </p>
            </div>

            {/* Licenses and Schedule */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.licenses &&
                job?.licenses.map((license, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg"
                  >
                    {license}
                  </span>
                ))}
              {job.schedule &&
                job?.schedule.map((sch, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg"
                  >
                    {sch}
                  </span>
                ))}
            </div>

            {/* Min Hours */}
            <div>
              <p className="text-sm text-gray-500">
                Min Hours:{" "}
                <span className="text-gray-700 font-medium">
                  {job.minHours} hours/week
                </span>
              </p>
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
    `https://api.kinscare.org/api/v1/caregivers/jobs/${userId}?page=${page}`
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
    "https://api.kinscare.org/api/v1/caregivers/jobs/filter",
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
              <button
                onClick={() => setPage((prevPage) => prevPage + 1)}
                className="bg-blue-500 text-white rounded px-4 py-2"
                disabled={loading}
              >
                Load More
              </button>
            )}
            {page >= totalPages && !loading && <p>No more jobs available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default All;
