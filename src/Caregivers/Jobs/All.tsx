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

const JobPostCard: React.FC<{ job: Job }> = ({ job }) => {
  console.log(job)
  return (
    <div className="bg-white shadow-sm relative border-gray-50 border rounded-lg p-6 my-4 w-full mx-auto">
      <Link href={`/vitae/jobs/${job._id}`}>
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
          {job.licenses.map((license, index) => (
            <div
              key={index}
              className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
            >
              <span className="text-sm text-gray-600">{license}</span>
            </div>
          ))}
          {job.schedule.map((sch, index) => (
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
     <ApplyNow providerName={job.provider} job={job} jobID={job._id} />
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
  console.log(userData);
  const loadJobs = async (applyFilters = false) => {
    setLoading(true);
    try {
      const data = await fetchJobs(userID, page);

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
      setTotalPages(job.pagination.totalPages);
      setTotalJobs(job.pagination.totalJobs);
      setJobs(job.jobs);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  console.log(totalJobs);
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
