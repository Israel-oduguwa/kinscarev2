"use client";
import React, { useContext, useEffect, useState } from "react";
import MongoContext from "@/app/MongoContext";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Interweave } from "interweave";
import { BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

interface Job {
  _id: string;
  title: string;
  certifications: string;
  compensation: string;
  contacts: {
    address: string;
    city: string;
    email: string;
    tel: string;
    zipcode: string;
  };
  created: string;
  description: string;
  licenses: string[];
  minHours: number;
  mobility: string;
  schedule: string[];
  draft: boolean;
}

const JobPostCard: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <div className="bg-white shadow-md max-w-5xl rounded-lg p-6 my-4 w-full mx-auto">
      <Link href={"/find-jobs"}>
        <div className="flex gap-4 items-center mb-3">
          <div>
            <img
              className="h-8"
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="company logo"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
            <p className="text-sm font-normal text-gray-600 antialiased">
              {job.contacts.address}, {job.contacts.city},{" "}
              {job.contacts.zipcode}
            </p>
          </div>
        </div>
        <div className="w-full mb-3">
          <Interweave
            className="antialiased text-sm text-gray-600 font-medium line-clamp-2"
            content={job.certifications}
          />
        </div>
        <div className=" w-full flex-wrap gap-4 flex mb-3">
          <div className="mb-2">
            <div className="w-full flex gap-1">
              {job.licenses.map((license, index) => (
                <div
                  key={index}
                  className="relative text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 grid select-none items-center whitespace-nowrap rounded-lg py-1.5 px-3"
                >
                  <span className="text-sm text-gray-600">{license}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-2">
            <div className="w-full flex gap-1">
              {job.schedule.map((sch, index) => (
                <div
                  key={index}
                  className="relative text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 grid select-none items-center whitespace-nowrap rounded-lg py-1.5 px-3"
                >
                  <span className="text-sm font-medium  text-gray-600">
                    {sch}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full gap-4 items-center flex">
          <p className="text-gray-500 text-sm ">
            Min Hours:{" "}
            <span className="text-gray-600">{job.minHours} hours/week </span>
          </p>
          <p className="text-gray-600 flex gap-1 items-center text-sm ">
            <BadgeDollarSign size={20} /> {job.compensation}
          </p>
        </div>
      </Link>
    </div>
  );
};

function JobOpenings() {
  const mongoContext: any = useContext(MongoContext);
  const { user } = mongoContext;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openings, setOpenings] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const jobsPerPage = 10;
  const { toast } = useToast();

  // State for filters
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);

  const handleFilterChange = (type: "shift" | "license", value: string) => {
    if (type === "shift") {
      setSelectedShifts((prev) =>
        prev.includes(value)
          ? prev.filter((shift) => shift !== value)
          : [...prev, value]
      );
    } else if (type === "license") {
      setSelectedLicenses((prev) =>
        prev.includes(value)
          ? prev.filter((license) => license !== value)
          : [...prev, value]
      );
    }
  };

  const fetchJobs = async (pageNumber: number) => {
    setLoading(true);
    try {
      // Default filter
      const filters: any = {
        draft: false,
      };

      // Apply filters only if they are selected

      const pipeline = [
        {
          $match: {
            $and: [
              // { schedule: { $all: selectedShifts } },
              // { licenses: { $all: selectedLicenses } },
              { draft: false },
            ],
          },
        },
        {
          $project: { applicants: 0 },
        },
        {
          $sort: { created: -1 },
        },
        {
          $skip: (pageNumber - 1) * jobsPerPage,
        },
        {
          $limit: jobsPerPage,
        },
      ];
      console.log(pipeline);
      const result: any = await user?.callFunction("web_fetch_jobs", pipeline);
      if (result?.err) {
        throw new Error(result.err);
      } else if (result?.data.length) {
        setOpenings((prev) => [...prev, ...result.data]);

        if (result.data.length < jobsPerPage) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"
        ),
        description:
          err.message || "An unexpected error occurred while fetching jobs.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleApplyFilters = () => {
    setPage(1); // Reset to the first page
    setOpenings([]); // Clear the current openings
    fetchJobs(1); // Fetch the jobs with the new filters
  };

  useEffect(() => {
    if (user) {
      fetchJobs(page);
    }
  }, [user, page]);

  return (
    <div className="w-full bg-gray-100 py-8">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 sm:py-12">
        {/* Filter Section */}
        <div className="sticky top-0 z-10 bg-white shadow-md p-4 rounded-lg w-full max-w-5xl mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">
            Find jobs near you
          </h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            {/* Shift Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
              <p className="font-semibold text-gray-800">Shifts</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Full time",
                  "Part time",
                  "Weekend",
                  "On Call",
                  "Live In",
                ].map((shift) => (
                  <label
                    key={shift}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedShifts.includes(shift)}
                      onCheckedChange={() => handleFilterChange("shift", shift)}
                    />
                    <span>{shift}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* License Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
              <p className="font-semibold text-gray-800">License</p>
              <div className="flex flex-wrap gap-2">
                {["CNA", "HCA", "NAR", "None"].map((license) => (
                  <label
                    key={license}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedLicenses.includes(license)}
                      onCheckedChange={() =>
                        handleFilterChange("license", license)
                      }
                    />
                    <span>{license}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>

        {loading && page === 1 ? (
          <>
            {/* Skeleton loaders to simulate loading state */}
            <Skeleton className="max-w-5xl h-64 rounded-lg p-6 my-4 w-full mx-auto mb-4 bg-gray-300" />
            <Skeleton className="max-w-5xl h-64 rounded-lg p-6 my-4 w-full mx-auto mb-4 bg-gray-300" />
            <Skeleton className="max-w-5xl h-64 rounded-lg p-6 my-4 w-full mx-auto mb-4 bg-gray-300" />
            <Skeleton className="max-w-5xl h-64 rounded-lg p-6 my-4 w-full mx-auto mb-4 bg-gray-300" />
          </>
        ) : error ? (
          <p className="text-red-500">Failed to load jobs: {error}</p>
        ) : (
          <>
            {openings.map((job) => (
              <JobPostCard key={job._id} job={job} />
            ))}
            {hasMore && !loading ? (
              <Button onClick={handleLoadMore} className="mt-6">
                Load More
              </Button>
            ) : (
              <>
                <div className="mt-6 loader"></div>
              </>
            )}
            {loading && page > 1 && (
              <div className="mt-6">
                <Skeleton className="h-10 w-40" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default JobOpenings;
