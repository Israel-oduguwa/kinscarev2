/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState, useContext } from "react";
import { useApiClient } from "@/hooks/useApiClient";
import { useAuthContext } from "@/context/AuthContext";
import RecommendProgram from "./RecommendProgram";

type ProgramUrl = { program_name: string; url: string };
type ScrapedContent = { url: string; bodyText: string };
type ParsedResult = {
  url: string;
  data: { [key: string]: any };
};
type CachedParsedPrograms = {
  results: ParsedResult[];
  timestamp: number;
};

const CACHE_KEY = "parsed_program_recommendations";
const CACHE_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

function getUrlsFromLocalStorage(): ProgramUrl[] | null {
  try {
    const ls = localStorage.getItem("ai_recommendation");
    if (!ls) return null; // <- no key in LS
    const parsed = JSON.parse(ls);
    if (
      parsed.collegePrograms &&
      Array.isArray(parsed.collegePrograms) &&
      parsed.collegePrograms.length > 0
    ) {
      return parsed.collegePrograms;
    }
    return null;
  } catch {
    return null;
  }
}

function pickRandomUrls(urls: ProgramUrl[], n: number) {
  const arr = [...urls];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

const steps = [
  "Collecting program URLs…",
  "Scraping program webpages…",
  "Parsing program details…",
  "Done!",
];

const ProgramRecommendation: React.FC = () => {
  const { user }: any = useAuthContext();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ParsedResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecUI, setShowRecUI] = useState(false); // <-- NEW: flag to show <ReccommendProgram/>

  // Util: Get cached results if not expired
  function getCachedResults(): ParsedResult[] | null {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      if (!cache) return null;
      const { results, timestamp }: CachedParsedPrograms = JSON.parse(cache);
      if (Date.now() - timestamp < CACHE_DURATION_MS) return results;
      return null;
    } catch {
      return null;
    }
  }

  // Util: Save results to cache
  function saveToCache(results: ParsedResult[]) {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ results, timestamp: Date.now() })
    );
  }

  useEffect(() => {
    // 1) Check cache first
    const cached = getCachedResults();
    if (cached && cached.length > 0) {
      setResults(cached);
      setProgress(3);
      setIsLoading(false);
      return;
    }

    // 2) Source URLs: localStorage first, then context fallback
    let urls: ProgramUrl[] | null = getUrlsFromLocalStorage();

    if ((!urls || urls.length === 0) && contactData?.recommendations) {
      const collegePrograms = contactData.recommendations.collegePrograms;
      if (Array.isArray(collegePrograms) && collegePrograms.length > 0) {
        urls = collegePrograms;
      }
    }

    // 3) If still no URLs, show the ReccommendProgram UI (not an error)
    if (!urls || urls.length === 0) {
      setShowRecUI(true);
      setIsLoading(false);
      return;
    }

    // 4) We have URLs → proceed
    const selectedUrls = pickRandomUrls(urls, 6);

    const fetchData = async () => {
      setIsLoading(true);
      setProgress(0);
      try {
        setProgress(1);
        const scrapeRes = await privateApi.post(
          "/api/v1/ai/scrape-web",
          { urls: selectedUrls.map((u) => u.url) },
          { timeout: 80000 }
        );
        const scraped: ScrapedContent[] = scrapeRes.data?.content || [];
        if (!Array.isArray(scraped) || scraped.length === 0)
          throw new Error("Scraping failed or no content returned.");

        setProgress(2);
        const parseRes = await privateApi.post(
          "/api/v1/ai/parse-content",
          { content: scraped },
          { timeout: 80000 }
        );
        const parsed: ParsedResult[] = parseRes.data?.results || [];
        if (!Array.isArray(parsed) || parsed.length === 0)
          throw new Error("Parsing failed or no programs parsed.");

        setResults(parsed);
        saveToCache(parsed);
        setProgress(3);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "An error occurred during program recommendation fetching."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Progress UI
  const renderProgress = () => (
    <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-1 bg-gray-200 rounded-full"></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((_, index) => (
            <div key={index} className="relative z-10">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${
                  index <= progress
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }
                transition-all duration-500 ease-in-out
              `}
              >
                {index < progress ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="font-medium">{index + 1}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="text-gray-700 text-lg font-medium mb-1 animate-pulse">
          {steps[progress]}
        </div>
        <div className="text-sm text-gray-500">
          {progress + 1} of {steps.length} steps
        </div>
      </div>
    </div>
  );

  // ------------- Render branches -------------

  // A) If no LS key/context URLs → show your recommendation UI
  if (showRecUI) {
    return <RecommendProgram />;
  }

  // B) Error branch (only for real errors during scrape/parse)
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-6">
        <h3 className="py-2 font-semibold text-gray-800">
          Recommended Programs
        </h3>
        <div className="bg-red-50 p-4 rounded-xl max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center mb-3">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="text-red-600 text-lg font-semibold text-center mb-2">
            Something went wrong
          </div>
          <div className="text-gray-600 text-center">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  // C) Loading
  if (isLoading || !results)
   
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="mb-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 animate-spin opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mt-6 text-gray-800">
            Finding the best programs for you
          </h2>
        </div>
        {renderProgress()}
      </div>
    );

  // D) Results
  //  console.log(results)
  return (
    <div className="grid gap-6">
      {results &&
        results.map((program, i) => (
          <>
            {program && (
              <div
                key={program?.url}
                className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  i === 0 ? "ring-2 ring-blue-100 ring-opacity-50" : ""
                } relative overflow-hidden`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <a
                        href={program?.data?.program_url || program?.url}
                        className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors group"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {program?.data?.institution}
                        <svg
                          className="w-4 h-4 ml-1.5 inline-block text-indigo-500 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                      {program?.data?.institution && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <svg
                            className="w-4 h-4 mr-1.5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          {program?.data?.program_name}
                        </div>
                      )}
                    </div>

                    {program?.data?.degree_type && (
                      <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium inline-flex items-center self-start">
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        {program.data.degree_type}
                      </div>
                    )}
                  </div>

                  {program?.data?.description && (
                    <div className="text-gray-600 text-sm truncate leading-relaxed">
                      {program.data.description}
                    </div>
                  )}

                  <div className="mt-1 flex flex-wrap gap-2">
                    {program?.data?.location && (
                      <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs">
                        <svg
                          className="w-4 h-4 mr-1.5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {program.data.location}
                      </div>
                    )}
                    {program?.data?.duration && (
                      <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs">
                        <svg
                          className="w-4 h-4 mr-1.5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {program.data.duration}
                      </div>
                    )}
                    {program?.data?.tuition && (
                      <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs">
                        <svg
                          className="w-4 h-4 mr-1.5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {program.data.tuition}
                      </div>
                    )}
                    {program?.data?.accreditation && (
                      <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs">
                        <svg
                          className="w-4 h-4 mr-1.5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        {program.data.accreditation}
                      </div>
                    )}
                  </div>

                  {(program?.data?.contact_name ||
                    program?.data?.contact_email ||
                    program?.data?.contact_phone) && (
                    <div className="mt-2 pt-1 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        Contact Information
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {program.data.contact_name && (
                          <div className="flex items-center text-gray-600">
                            {program.data.contact_name}
                          </div>
                        )}
                        {program.data.contact_email && (
                          <a
                            href={`mailto:${program.data.contact_email}`}
                            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {program.data.contact_email}
                          </a>
                        )}
                        {program.data.contact_phone && (
                          <a
                            href={`tel:${program.data.contact_phone}`}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {program.data.contact_phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ))}
    </div>
  );
};

export default ProgramRecommendation;
