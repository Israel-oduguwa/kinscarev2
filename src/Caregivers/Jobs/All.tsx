/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import JobListingLogo from "@/components/JobListingLogo";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { Interweave } from "interweave";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import TagManager from "react-gtm-module";

import JobSearchHeader from "./JobSearchHeader";
import ApplyNow from "./JobsUI/ApplyNow";

// ⬇️ NEW: bring in your Saved & Applied tab components
import AppliedJobs from "./AppliedJobs";
import FavoriteJobs from "./FavoriteJobs";
import { JobCardSkeleton } from "./JobCardSkeleton";

/** ---------- Small UI bits (unchanged) ---------- **/
const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
    {children}
  </span>
);

const JobPostCard: React.FC<{ job: any }> = ({ job }) => {
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

/** ---------- Types (unchanged) ---------- **/
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

interface JobsApiResponse {
  pagination?: {
    totalJobs: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  totalJobs?: number;
  totalPages?: number;
  currentPage?: number;
  jobs: Job[];
}

/** ---------- API fns (unchanged) ---------- **/
const fetchJobs = async (
  userId: string,
  page: number
): Promise<JobsApiResponse> => {
  const response = await fetch(
    `http://localhost:8081/api/v1/caregivers/jobs/${userId}?page=${page}`
  );
  if (!response.ok) throw new Error("Error fetching jobs");
  return response.json();
};

const fetchFilteredJobs = async (
  userId: string,
  page: number,
  filters: any,
  privateApi: any,
  geoCode: any
): Promise<JobsApiResponse> => {
  const response = await privateApi.post(
    "/api/v1/caregivers/jobs/filter",
    { userID: userId, page, geoCode, filters }
  );
  console.log(response, "checks")
  return response.data;
};

/** ---------- NEW: Simple Tabs UI (no logic changes elsewhere) ---------- **/
type TabKey = "all" | "saved" | "applied";

const TabsBar: React.FC<{
  value: TabKey;
  onChange: (t: TabKey) => void;
}> = ({ value, onChange }) => {
  const item = (key: TabKey, label: string) => {
    const active = value === key;
    return (
      <button
        type="button"
        onClick={() => onChange(key)}
        aria-current={active ? "page" : undefined}
        className={[
          "px-4 py-2 rounded-lg text-sm font-medium transition",
          active
            ? "bg-gray-900 text-white shadow-sm"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="sticky top-0 z-20 bg-gray-100/80 backdrop-blur supports-backdrop-filter:bg-gray-100/60">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-3">
        <div className="flex items-center gap-2">
          {item("all", "All")}
          {item("saved", "Saved")}
          {item("applied", "Applied")}
        </div>
      </div>
      <div className="h-px my-2 bg-gray-200" />
    </div>
  );
};

/** ---------- NEW: CTA (placed AFTER Load More) ---------- **/
const CompareProgramsCTA: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Compare Programs
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              Compare colleges and universities offering programs that lead to
              nursing and other healthcare careers.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="px-5">Start comparing</Button>
            {/* Optional secondary link:
            <Button variant="outline">Learn more</Button>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

/** ---------- Main Component (original logic preserved) ---------- **/
function All() {
  const {userData} = useAuthContext();
  const { userID } = userData || {};
  // NEW: local tab (UI-only)
  const [tab, setTab] = useState<TabKey>("all");

  // Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { privateApi } = useApiClient();

  // UI filter form state
  const [filters, setFilters] = useState({
    schedule: [] as string[],
    licenses: [] as string[],
    minHours: 8, // not used by backend now, but kept for UI
  });

  // Applied filter state (what the backend actually uses)
  const [mode, setMode] = useState<"all" | "filtered">("all");
  const [appliedFilters, setAppliedFilters] = useState<typeof filters | null>(
    null
  );
  const [appliedGeo, setAppliedGeo] = useState<any>(null);

  // prevent race conditions when page/mode changes quickly
  const reqIdRef = useRef(0);

  const normalizePagination = (data: JobsApiResponse) => {
    // Support both shapes: with pagination or top-level fields
    const p = data.pagination;
    return {
      totalPages: p ? p.totalPages : data.totalPages ?? 1,
      totalJobs: p ? p.totalJobs : data.totalJobs ?? data.jobs?.length ?? 0,
      currentPage: p ? p.currentPage : data.currentPage ?? 1,
    };
  };

  const load = async () => {
    if (!userID) return;

    setLoading(true);
    setError(null);
    const rid = ++reqIdRef.current;

    try {
      let data: JobsApiResponse;

      if (mode === "filtered" && appliedFilters) {
        const geoCode = appliedGeo ?? userData?.geocode_address ?? null;
        data = await fetchFilteredJobs(
          userID,
          page,
          appliedFilters,
          privateApi,
          geoCode
        );
      } else {
        data = await fetchJobs(userID, page);
      }

      // stale request guard
      if (rid !== reqIdRef.current) return;

      const { totalPages: tp, totalJobs: tj } = normalizePagination(data);

      setTotalPages(tp);
      setTotalJobs(tj);

      setJobs((prev) => (page === 1 ? data.jobs : [...prev, ...data.jobs]));
    } catch (err: any) {
      if (rid !== reqIdRef.current) return;
      setError(err?.message || "Failed to load jobs");
    } finally {
      if (rid === reqIdRef.current) setLoading(false);
    }
  };

  // Load whenever page, mode, or applied filters/geo change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    mode,
    JSON.stringify(appliedFilters),
    JSON.stringify(appliedGeo),
    userID,
  ]);

  // Initial load (all jobs, page 1)
  useEffect(() => {
    setMode("all");
    setAppliedFilters(null);
    setAppliedGeo(null);
    setPage(1);
  }, [userID]);

  const applyFilters = async () => {
    // Set applied filters and reset paging
    const geoCode = userData?.geocode_address ?? null;

    // Fire analytics
    TagManager.dataLayer({
      dataLayer: {
        event: "search_jobs",
        settings: userData?.settings,
        filters,
        lname: userData?.lname,
        fname: userData?.fname,
        tel: userData?.auth?.tel,
        zipcode: userData?.zipcode,
        city: userData?.city,
        email: userData?.auth?.email,
      },
    });

    setMode("filtered");
    setAppliedFilters(filters);
    setAppliedGeo(geoCode);
    setPage(1); // crucial: reset to page 1 so we don’t ask for “last page” of a new query
  };

  const loadMore = () => {
    if (loading) return;
    if (page >= totalPages) return;
    setPage((p) => p + 1);
  };

  const hasMore = page < totalPages;

  return (
    <div className="py-6 px-2 bg-gray-100 md:px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Job Search Header (always on top, shared across tabs) */}
        <JobSearchHeader
          filters={filters}
          setFilters={setFilters}
          handleSearch={applyFilters}
          loading={loading}
        />

        {/* NEW: Tabs bar (sticky under the header) */}
        <TabsBar value={tab} onChange={setTab} />

        {/* Tab content */}
        {tab === "all" && (
          <div>
            {/* --- ORIGINAL All Jobs block (unchanged) --- */}
            <div>
              {loading && jobs.length === 0 && (
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 gap-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <JobCardSkeleton key={idx} />
                    ))}
                  </div>
                </div>
              )}

              {!loading && totalJobs > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-gray-800">
                    Found {totalJobs} job(s)
                    {mode === "filtered" ? " for your search" : ""}.
                  </p>
                </div>
              )}

              {!loading && jobs.length === 0 && (
                <p className="text-sm text-gray-600">No jobs found.</p>
              )}

              {jobs.map((job: any) => (
                <JobPostCard key={job._id} job={job} />
              ))}

              <div className="flex justify-center mt-4">
                {hasMore && (
                  <Button onClick={loadMore} disabled={loading}>
                    {loading ? "Loading…" : "Load More"}
                  </Button>
                )}
                {!hasMore && jobs.length > 0 && (
                  <p className="text-sm text-gray-600">
                    No more jobs available
                  </p>
                )}
              </div>
            </div>

            {/* NEW: CTA strictly AFTER Load More */}
            <CompareProgramsCTA />
          </div>
        )}

        {tab === "saved" && (
          <div>
            <FavoriteJobs />
            {/* CTA AFTER Saved list */}
            <CompareProgramsCTA />
          </div>
        )}

        {tab === "applied" && (
          <div>
            <AppliedJobs />
            {/* CTA AFTER Applied list */}
            <CompareProgramsCTA />
          </div>
        )}
      </div>
    </div>
  );
}

export default All;