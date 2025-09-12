import { Interweave } from "interweave";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import OauthApply from "./OauthApply";
import Image from "next/image";
import SigninModal from "@/Authentication/SiginModal";
import { MapPin, Clock, BadgeCheck } from "lucide-react";
import JobListingLogo from "@/components/JobListingLogo";
import SearchInfo from "./SearchInfo";

/** Safe query builder to avoid "undefined" in URLs */
const buildQuery = (
  params: Record<string, string | number | null | undefined>
) => {
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

const Logo: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => {
  const fallback =
    "https://lh3.googleusercontent.com/-g8IwNe70-kE/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkl1tpVAKXAezzCNWmKH5JWvlgr_xw/photo.jpg?sz=64";
  return (
    <div className="relative h-14 w-14 rounded-2xl overflow-hidden ring-1 ring-black/5">
      <Image
        src={src || fallback}
        alt={alt || "logo"}
        fill
        sizes="56px"
        className="object-cover"
        priority={false}
      />
    </div>
  );
};

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
      className="group relative w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md focus-within:shadow-md"
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

        <div className="w-full lg:w-auto">
          <OauthApply  publicPage={true} job={job} jobID={job?._id}>
            <Button className="w-full rounded-xl px-6 py-3 shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:shadow-[0_12px_28px_-10px_rgba(59,130,246,0.65)]">
              Join to apply
            </Button>
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
  const base =
    "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/caregivers/jobs-search";
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
  // console.log(jobs);
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
    <div className="min-h-screen py-20 bg-gradient-to-b from-gray-50 to-white">
      {/* Top header zone */}
      <div className="relative border-b  border-gray-200/70 bg-[radial-gradient(60%_80%_at_50%_-20%,rgba(59,130,246,0.10),transparent)]">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-6">
            <SearchBar />
       <SearchInfo jobs={jobs} filters={filters} totalJobs={totalJobs} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-5">
          {jobs.length > 0 ? (
            jobs.map((job: any) => <JobPostCard key={job._id} job={job} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <div className="mx-auto mb-4 h-16 w-16 text-gray-300">
                {/* simple inline illustration */}
                <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
                  <path
                    d="M7 4h10a2 2 0 0 1 2 2v11l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 8h6M9 12h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-700">
                No jobs found for the selected filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination vs Read-more */}
        <div className="mt-10">
          {mode === "paged" ? (
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              {currentPage > 1 ? (
                <Link href={prevHref} className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    className="w-full rounded-xl border border-gray-200"
                  >
                    Previous
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 text-gray-400 sm:w-auto"
                  disabled
                >
                  Previous
                </Button>
              )}

              <div className="text-sm font-medium text-gray-800">
                Page <span className="font-bold">{currentPage}</span> of{" "}
                <span className="font-bold">{totalPages}</span>
              </div>

              {currentPage < totalPages ? (
                <Link href={nextHref} className="w-full sm:w-auto">
                  <Button className="w-full rounded-xl sm:w-auto">Next</Button>
                </Link>
              ) : (
                <Button
                  className="w-full cursor-not-allowed rounded-xl bg-gray-200 text-gray-500 sm:w-auto"
                  disabled
                >
                  Next
                </Button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              {hasMore ? (
                <Link href={nextHref} className="w-full sm:w-auto">
                  <Button className="w-full rounded-xl px-8 sm:w-auto">
                    Load more
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  className="cursor-not-allowed rounded-xl bg-gray-200 text-gray-500"
                  disabled
                >
                  No more jobs
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default All;
