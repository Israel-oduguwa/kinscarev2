/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function ProfessionProfile({ userData }: any) {
  const [jobSummary, setJobSummary] = useState<any>(
    userData?.jobSummary || null
  );
  const [loading, setLoading] = useState(!userData?.jobSummary);

  useEffect(() => {
    // Only fetch if userData exists and jobSummary is either missing or stale
    if (
      userData &&
      (!jobSummary || isDataStale(userData?.lastSummaryUpdated))
    ) {
      fetchJobSummary();
    }
  }, [userData]);

  // Function to fetch job summary from the database or OpenAI
  const fetchJobSummary = async () => {
    try {
      setLoading(true);

      // Check if job summary exists in the database
      const dbResponse = await axios.post(
        "https://api.kinscare.org/api/v1/auth/crud-operation",
        {
          collectionName: "users",
          operation: "findOne",
          filter: { userID: userData.userID },
          projection: { jobSummary: 1, lastSummaryUpdated: 1 },
        }
      );

      const { jobSummary, lastSummaryUpdated } = dbResponse.data || {};

      if (jobSummary && !isDataStale(lastSummaryUpdated)) {
        // Use the existing job summary if it's not stale
        setJobSummary(jobSummary);
      } else if (!jobSummary || isDataStale(lastSummaryUpdated)) {
        // Fetch new job summary from OpenAI and save it to the database
        const newJobSummary = await fetchFromOpenAI();
        await saveToDatabase(newJobSummary);
        setJobSummary(newJobSummary);
      }
    } catch (error) {
      console.error("Error fetching job summary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if data is stale (e.g., older than 1 day)
  const isDataStale = (lastSummaryUpdated: string): boolean => {
    if (!lastSummaryUpdated) return true; // No timestamp means stale
    const oneDay = 24 * 60 * 60 * 1000;
    const lastUpdatedTime = new Date(lastSummaryUpdated).getTime();
    return Date.now() - lastUpdatedTime > oneDay;
  };

  // Fetch data from OpenAI (called only when jobSummary is missing or stale)
  const fetchFromOpenAI = async () => {
    try {
      const payload = {
        title: userData?.recommendation[0].title,
        institution: userData?.recommendation[0].institution,
      };
      const response = await axios.post(
        "https://api.kinscare.org/api/v1/ai/recommendation",
        payload
      );
      // console.log(response)
      const parsedData = JSON.parse(response.data);
      return parsedData;
    } catch (error) {
      console.error("Error fetching data from OpenAI:", error);
      throw error;
    }
  };

  // Save new job summary to the database
  const saveToDatabase = async (jobSummary: any) => {
    try {
      await axios.post("https://api.kinscare.org/api/v1/auth/crud-operation", {
        collectionName: "users",
        operation: "updateOne",
        filter: { userID: userData.userID },
        update: {
          $set: {
            jobSummary,
            lastSummaryUpdated: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("Error saving job summary to the database:", error);
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!jobSummary) {
    return <div>No job summary available.</div>;
  }
  // console.log(jobSummary)
  return (
    <div>
      {userData ? (
        <div className="shadow-md border border-gray-50 p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl">
          {/* Title */}
          <div className="mb-6">
            <p className="text-xl font-bold tracking-tight text-gray-900 antialiased">
              {jobSummary.job_title} Career
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Stay informed and take actionable steps toward your professional
              goals.
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Average Salary */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm antialiased">
                  Average Salary
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {jobSummary.average_salary}
                </p>
              </div>
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c.66 0 1.29.26 1.76.73a2.49 2.49 0 010 3.54A2.49 2.49 0 0112 15m0-7a7 7 0 00-4.93 11.93c.9.9 1.98 1.38 3.18 1.44m1.75-13.12a2.49 2.49 0 010 3.54A2.49 2.49 0 0112 15m-4.93 1.44A7 7 0 1012 5"
                  />
                </svg>
              </div>
            </div>

            {/* Job Openings */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm antialiased">
                {jobSummary.job_title} Job Openings
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {jobSummary.job_openings}
                </p>
              </div>
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h11m-6-6h6m-4 12h4m-5 5H5a2 2 0 01-2-2V5a2 2 0 012-2h7a2 2 0 012 2v8m-4 5h2a2 2 0 002-2v-2a2 2 0 00-2-2h-1"
                  />
                </svg>
              </div>
            </div>

            {/* Market Trends */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm antialiased">
                  Market Trends
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {jobSummary.market_trend}
                </p>
              </div>
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h2.5m2-1h2.5m-2-3h2.5m-2 7h2.5M3 12h11m-6-6h6m-4 12h4m-5 5H5a2 2 0 01-2-2V5a2 2 0 012-2h7a2 2 0 012 2v8m-4 5h2a2 2 0 002-2v-2a2 2 0 00-2-2h-1"
                  />
                </svg>
              </div>
            </div>

            {/* Professional Tips */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm antialiased">
                  Professional Tips
                </p>
                <HoverCard>
                  <HoverCardTrigger>
                    <p
                      className=" font-semibold text-indigo-600 cursor-pointer"
                      title="Hover to view tips"
                    >
                      +{jobSummary.professional_tips && jobSummary?.professional_tips.length} New Tips
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent className="p-4 rounded-lg shadow-xl bg-white border border-gray-200 max-w-md">
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      Professional Tips
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {jobSummary.professional_tips && jobSummary.professional_tips.map(
                        (tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        )
                      )}
                    </ul>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7l10 10M7 17L17 7m5 5a10 10 0 11-20 0 10 10 0 0120 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500 antialiased">
              Increasing your score brings you closer to your professional goal.
            </p>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ProfessionProfile;
