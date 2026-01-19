import SearchBar from "./SearchBar";
import SearchInfo from "./SearchInfo";
import JobOpeningsList from "./JobOpeningsList";

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
    <div className="relative min-h-screen py-10 bg-slate-950/5 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(59,130,246,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_20%,rgba(30,64,175,0.12),transparent_60%)]" />
        <div className="absolute -top-24 right-6 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:36px_36px] opacity-30" />
      </div>
      {/* Top header zone */}
      <div className="relative border-b pt-0 xl:pt-10 md:pt-6 border-white/70 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-0 md:gap-4 lg:gap-6">
            <SearchBar />
            <SearchInfo jobs={jobs} filters={filters} totalJobs={totalJobs} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="relative mx-auto max-w-7xl px-4 py-6">
        <JobOpeningsList
          jobs={jobs}
          mode={mode}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          prevHref={prevHref}
          nextHref={nextHref}
        />
      </div>
    </div>
  );
}

export default All;
