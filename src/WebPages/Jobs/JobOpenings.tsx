import { Interweave } from "interweave";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import OauthApply from "./OauthApply";
import Image from "next/image";
import SigninModal from "@/Authentication/SiginModal";

/** Safe query builder to avoid "undefined" in URLs */
const buildQuery = (params: Record<string, string | number | null | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s || s === "undefined" || s === "null") continue;
    sp.set(k, s);
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
};

const JobPostCard: React.FC<{ job: any }> = ({ job }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 my-4 w-full mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <Link href={`/jobs/${job._id}`} className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            {!!job?.profileImage && (
              <Image
                className="h-14 w-14 rounded-full object-cover"
                width={56}
                height={56}
                src={
                  job.profileImage ||
                  "https://lh3.googleusercontent.com/-g8IwNe70-kE/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkl1tpVAKXAezzCNWmKH5JWvlgr_xw/photo.jpg?sz=46"
                }
                alt="company logo"
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                {job?.title}
              </h2>
              <p className="text-sm text-gray-600">
                {job?.contacts?.address ?? "—"}
                {job?.contacts?.city ? `, ${job.contacts.city}` : ""}
                {job?.contacts?.zipcode ? `, ${job.contacts.zipcode}` : ""}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-700 line-clamp-2">
              <Interweave content={job?.certifications ?? ""} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            {Array.isArray(job?.licenses) &&
              job.licenses.map((license: string, i: number) => (
                <div key={`lic-${i}`} className="text-sm bg-gray-100 text-gray-800 rounded-full px-3 py-1">
                  {license}
                </div>
              ))}
            {Array.isArray(job?.schedule) &&
              job.schedule.map((sch: string, i: number) => (
                <div key={`sch-${i}`} className="text-sm bg-gray-100 text-gray-800 rounded-full px-3 py-1">
                  {sch}
                </div>
              ))}
          </div>

          <div className="flex items-center gap-6">
            <p className="text-sm text-gray-700">
              Min Hours: <span className="font-medium">{job?.minHours ?? "—"} hours/week</span>
            </p>
          </div>
        </Link>

        <div className="flex-shrink-0 w-full lg:w-auto self-center lg:self-start">
          <OauthApply job={job} jobID={job?._id}>
            <Button className="w-full lg:w-auto px-6 py-3 text-white rounded-lg">Apply Now</Button>
          </OauthApply>
        </div>
      </div>
    </div>
  );
};

async function All({
  schedule,
  licenses,
  page,
  minHours,
}: {
  schedule?: string;
  licenses?: string;
  minHours?: string;
  page?: number;
}) {
  const base = "https://kinscare-backend.onrender.com/api/v1/caregivers/jobs-search";
  const qs = buildQuery({
    schedule,
    licenses,
    minHours,
    page: page ?? 1,
    limit: 10,
  });

  const res = await fetch(`${base}${qs}`, { cache: "no-cache" });
  const response = await res.json();

  const jobs: any[] = Array.isArray(response?.jobs) ? response.jobs : [];
  const pagination = response?.pagination ?? {};
  const {
    mode = "stream",
    totalJobs = jobs.length ?? 0,
    totalPages = 1,
    currentPage = 1,
    hasMore = currentPage < totalPages,
    nextPage = hasMore ? currentPage + 1 : null,
    filters = { schedule: "", licenses: "", minHours: "" },
  } = pagination;

  // Build next/prev HREFs preserving filters (strings, never undefined)
  const baseRoute = "/find-jobs";
  const prevHref =
    currentPage > 1
      ? `${baseRoute}${buildQuery({
          schedule: filters.schedule,
          licenses: filters.licenses,
          minHours: filters.minHours,
          page: currentPage - 1,
        })}`
      : "#";

  const nextHref = hasMore
    ? `${baseRoute}${buildQuery({
        schedule: filters.schedule,
        licenses: filters.licenses,
        minHours: filters.minHours,
        page: (nextPage as number) || currentPage + 1,
      })}`
    : "#";

  return (
    <div className="py-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <SearchBar />
          <h1 className="tracking-tight font-semibold text-gray-700 mt-6">
            There are <span className="text-blue-600">{totalJobs}</span> jobs near you.{" "}
            {jobs.length > 0 ? (
              <>
                <OauthApply publicPage={true} job={jobs[0]} jobID={jobs[0]?._id}>
                  <span className="text-blue-600 font-bold">Register</span>
                </OauthApply>{" "}
                or{" "}
                <SigninModal role="caregiver">
                  <span className="cursor-pointer text-blue-600"> sign in</span>
                </SigninModal>{" "}
                now to view details and apply instantly.
              </>
            ) : (
              <span className="text-gray-600">Adjust your filters to discover more opportunities.</span>
            )}
          </h1>
        </div>

        <div className="space-y-6">
          {jobs.length > 0 ? (
            jobs.map((job: any) => <JobPostCard key={job._id} job={job} />)
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700">No jobs found for the selected filters.</p>
            </div>
          )}
        </div>

        {/* Pagination vs Read-more */}
        <div className="mt-8">
          {mode === "paged" ? (
            <div className="flex justify-between items-center">
              {currentPage > 1 ? (
                <Link
                  href={prevHref}
                  className="px-6 py-3 text-sm text-white bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md transition"
                >
                  Previous
                </Link>
              ) : (
                <button className="px-6 py-3 text-sm text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed" disabled>
                  Previous
                </button>
              )}

              <div className="text-sm text-gray-800 dark:text-white font-medium">
                Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={nextHref}
                  className="px-6 py-3 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
                >
                  Next
                </Link>
              ) : (
                <button className="px-6 py-3 text-sm text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed" disabled>
                  Next
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              {hasMore ? (
                <Link
                  href={nextHref}
                  className="px-8 py-3 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
                >
                  Load more
                </Link>
              ) : (
                <button className="px-8 py-3 text-sm text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed" disabled>
                  No more jobs
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default All;
