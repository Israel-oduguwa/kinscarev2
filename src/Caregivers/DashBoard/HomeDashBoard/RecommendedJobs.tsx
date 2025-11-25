"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Interweave } from "interweave";

function RecommendedJobs() {
 const  authData: any = useAuthContext();
  const { userData } = authData;

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      if (!userData || !userData.geocode_address) {
        setJobs([]);
        setLoading(false);
        return;
      }

      const geocode = userData.geocode_address.coordinates;
      const licenses = userData.licenses || [];
      const completedProfile = userData.complete;

      try {
        let pipeline: any[] = [];

        if (geocode && geocode.length === 2) {
          pipeline = [
            {
              $geoNear: {
                near: {
                  type: "Point",
                  coordinates: [geocode[0], geocode[1]], // Longitude, Latitude
                },
                query: { draft: false },
                spherical: true,
                distanceField: "distance",
                distanceMultiplier: 1 / 1609, // Convert meters to miles
              },
            },
            { $sort: { distance: 1, created: -1 } },
            { $limit: 3 },
          ];
        }

        if (pipeline.length === 0 && completedProfile && licenses.length > 0) {
          pipeline = [
            { $match: { draft: false, licenses: { $in: licenses } } },
            { $sort: { created: -1 } },
            { $limit: 3 },
          ];
        }

        if (pipeline.length === 0) {
          pipeline = [
            { $match: { draft: false } },
            { $sort: { created: -1 } },
            { $limit: 3 },
          ];
        }

        const response = await fetch(
          "/api/v1/auth/crud-operation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              collectionName: "jobs",
              operation: "aggregate",
              pipeline,
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          setJobs(result.result);
        } else {
          console.error("Error fetching jobs:", result.message);
          setJobs([]);
        }
      } catch (error) {
        console.error("Error fetching recommended jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [userData]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">
         Explore job opportunities
        </h2>
        <p className="text-sm text-gray-500">
          Curated opportunities just for you.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <div
              key={job._id}
              className="bg-white shadow-sm max-w-4xl rounded-lg p-6 mx-auto hover:shadow-md transition-all duration-300"
            >
              <Link href={`/vitae/jobs/${job._id}`}>
                {/* Header Section */}
                <div className="flex gap-4 items-center mb-4">
                  {job.profileImage ? (
                    <img
                      src={job.profileImage}
                      alt="company logo"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      🏢
                    </div>
                  )}
                  <div className="flex-1">
                    <h2
                      className="text-lg font-semibold text-ellipsis truncate w-96 text-gray-800 "
                      title={job.title}
                    >
                      {job.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {job.contacts.address}, {job.contacts.city},{" "}
                      {job.contacts.zipcode}
                    </p>
                  </div>
                </div>

                {/* Job Details */}
                {/* <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    <Interweave content={job.certifications} />
                  </p>
                </div> */}

                {/* Tags: Licenses and Schedule */}
                <div className="flex justify-between items-baseline">
                <div className="flex flex-wrap gap-3  text-ellipsis mb-4">
                  {job?.licenses?.slice(0, 2).map(
                    (
                      license:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      index: React.Key | null | undefined
                    ) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 rounded-full py-1 px-3"
                      >
                        {license}
                      </span>
                    )
                  )}
                  {job.schedule.slice(0, 2).map(
                    (
                      sch:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      index: React.Key | null | undefined
                    ) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-50 text-blue-600 rounded-full py-1 px-3"
                      >
                        {sch}
                      </span>
                    )
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 flex items-center">
                    💵 <span className="ml-1">{job.compensation}</span>
                  </p>
                </div>
                

                {/* Footer Section */}
                {/* <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Min Hours:{" "}
                    <span className="font-medium text-gray-700">
                      {job.minHours} hours/week
                    </span>
                  </p>
                  <p className="text-sm font-medium text-gray-800 flex items-center">
                    💵 <span className="ml-1">{job.compensation}</span>
                  </p>
                </div> */}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No jobs found. Check back later!</p>
      )}

      {/* Footer Button */}
      <div className="mt-6">
        <Link href="/vitae/jobs/all">
          <button className="w-full py-3 px-4 bg-blue-700 text-white font-semibold text-sm rounded-lg hover:bg-blue-600 transition">
            Find More Jobs
          </button>
        </Link>
      </div>
    </div>
  );
}

export default RecommendedJobs;
