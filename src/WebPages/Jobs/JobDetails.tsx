import { Interweave } from "interweave";
import { MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import { polyfill } from "interweave-ssr";
import { Button } from "@/components/ui/button";
import OauthApply from "./OauthApply";
import Image from "next/image";
import JobBackLink from "./JobBackLink";

polyfill();

/** ------------------------------
 *  Tiny Vercel-style Avatar
 *  ------------------------------ */
type AvatarProps = {
  src?: string | null;
  alt?: string;
  seed?: string;
  size?: number;
  rounded?: "full" | "2xl" | "xl" | "lg" | "md";
  className?: string;
};

const hashString = (str: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
};

const gradientFromString = (seed: string) => {
  const h = hashString(seed || "kinscare");
  let h1 = h % 360;
  let h2 = (h >> 5) % 360;
  if (Math.abs(h1 - h2) < 35) h2 = (h1 + 60) % 360;
  const c1 = `hsl(${h1} 85% 56%)`;
  const c2 = `hsl(${h2} 85% 46%)`;
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
};

const getInitials = (str: string) => {
  const cleaned = (str || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1][0] ?? "" : cleaned[1] ?? "";
  return (first + second).toUpperCase();
};

const shapeClass = (rounded: AvatarProps["rounded"]) => {
  switch (rounded) {
    case "full":
      return "rounded-full";
    case "xl":
      return "rounded-xl";
    case "lg":
      return "rounded-lg";
    case "md":
      return "rounded-md";
    default:
      return "rounded-2xl";
  }
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "logo",
  seed,
  size = 48,
  rounded = "2xl",
  className = "",
}) => {
  const fallbackSeed = (seed || alt || "KinsCare").trim();
  const initials = getInitials(fallbackSeed);
  const bg = gradientFromString(fallbackSeed);

  return (
    <div
      className={`relative shrink-0 rounded-full ring-1 ring-black/5 ${shapeClass(
        rounded
      )} ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt}
      role="img"
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover rounded-full"
          priority={false}
        />
      ) : (
        <div
          className="flex h-full w-full rounded-full items-center justify-center"
          style={{ background: bg }}
        >
          <span
            className="select-none text-white/95"
            style={{
              fontSize: Math.max(12, Math.floor(size * 0.36)),
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {initials}
          </span>
        </div>
      )}
    </div>
  );
};



/** ------------------------------
 *  Small Chip
 *  ------------------------------ */
const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
    {children}
  </span>
);

/** ------------------------------
 *  Similar Jobs (polished)
 *  ------------------------------ */
const SimilarJobs: React.FC<{ similarJobs: any[] }> = ({
  similarJobs = [],
}) => {
  if (!Array.isArray(similarJobs) || similarJobs.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-slate-800">Similar Jobs</p>
        <div className="mt-3 rounded-xl border border-dashed border-white/70 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
          No similar jobs found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm antialiased font-medium text-slate-800">
        Similar Jobs
      </p>
      <div className="mt-3 space-y-3">
        {similarJobs.map((job: any) => {
          const locationLine = [
            job?.contacts?.zipcode ?? "",
            job?.contacts?.city ?? "",
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <Link
              key={job._id}
              href={`/jobs/${job._id}`}
              className="block rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.4)] backdrop-blur transition hover:shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex items-start gap-2">
                <Avatar
                  src={job?.profileImage || undefined}
                  alt={job?.title || "Job"}
                  seed={job?.provider || job?.title || job?._id}
                  size={30}
                  rounded="full"
                />
                <div className="min-w-0">
                  <p className="mb-1 truncate text-sm font-semibold text-slate-900">
                    {job?.title}
                  </p>
                  <p className="text-xs text-slate-600">
                    {locationLine || "—"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.isArray(job?.licenses) &&
                      job.licenses
                        .slice(0, 2)
                        .map((license: any, idx: number) => (
                          <Chip key={`lic-${idx}`}>{license}</Chip>
                        ))}
                    {Array.isArray(job?.schedule) &&
                      job.schedule
                        .slice(0, 2)
                        .map((sch: any, idx: number) => (
                          <Chip key={`sch-${idx}`}>{sch}</Chip>
                        ))}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/** ------------------------------
 *  Main Page
 *  ------------------------------ */
async function JobDetails({ jobID }: { jobID: string }) {
  const data = await fetch(
    `http://localhost:8081/api/v1/caregivers/job/${jobID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  const { job, similarJobs } = response;

  const locationLine = [
    job?.contacts?.address ?? "",
    job?.contacts?.city ?? "",
    job?.contacts?.zipcode ?? "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="relative min-h-screen bg-slate-950/5 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(59,130,246,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_20%,rgba(30,64,175,0.12),transparent_60%)]" />
        <div className="absolute -top-24 right-6 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:36px_36px] opacity-30" />
      </div>
      <div className="relative mx-auto max-w-screen-xl mt-20 px-4 py-8">
        {/* Back & Title Row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <JobBackLink/>
          {/* 
          <div className="flex items-center gap-3">
            <OauthApply job={job} jobID={job._id}>
              <Button className="rounded-xl px-5 py-2.5 shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] hover:shadow-[0_12px_28px_-10px_rgba(59,130,246,0.65)]">
                Apply Now
              </Button>
            </OauthApply>
          </div> */}
        </div>

        {/* Header Card */}
        <div className="mb-8 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <Avatar
                src={job?.profileImage || undefined}
                alt={job?.title || "Job"}
                seed={job?.provider || job?.title || jobID}
                size={70}
                rounded="2xl"
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-[family:var(--header-font)] font-extrabold tracking-tight text-slate-800">
                  {job?.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  {job?.provider ? (
                    <span className="font-medium text-slate-800">
                      {job.provider}
                    </span>
                  ) : null}
                  {locationLine ? (
                    <>
                      {/* <span aria-hidden="true" className="text-gray-300">
                        •
                      </span> */}
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {locationLine}
                      </span>
                    </>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.isArray(job?.licenses) &&
                    job.licenses
                      .slice(0, 3)
                      .map((license: string, idx: number) => (
                        <Chip key={`lic-${idx}`}>{license}</Chip>
                      ))}
                  {Array.isArray(job?.schedule) &&
                    job.schedule
                      .slice(0, 3)
                      .map((sch: string, idx: number) => (
                        <Chip key={`sch-${idx}`}>{sch}</Chip>
                      ))}
                  {job?.minHours ? (
                    <Chip>
                      Min Hours:
                      <span className="ml-1 font-semibold">
                        {job.minHours}/wk
                      </span>
                    </Chip>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Secondary Apply (desktop visible here too) */}
            <div>
              <OauthApply job={job} jobID={job._id}>
                <Button className="w-full rounded-xl bg-blue-600 px-6 py-3 text-white shadow-[0_12px_28px_-14px_rgba(59,130,246,0.55)] transition hover:bg-blue-700 hover:shadow-[0_16px_32px_-14px_rgba(59,130,246,0.6)]">
                  Join to apply
                </Button>
              </OauthApply>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Content */}
          <div className="lg:col-span-2">
            {/* About */}
            <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
              <h2 className="mb-3 text-lg font-semibold tracking-tight text-slate-900">
                About this Role
              </h2>
              <div className="prose prose-sm max-w-none text-slate-800">
                <Interweave content={job?.description || "—"} />
              </div>

              {job?.certifications ? (
                <>
                  <div className="mt-6 h-px w-full bg-slate-100" />
                  <h3 className="mt-6 mb-3 text-base font-semibold text-slate-900">
                    Requirements & Certifications
                  </h3>
                  <div className="prose prose-sm max-w-none text-slate-800">
                    <Interweave content={job.certifications} />
                  </div>
                </>
              ) : null}
            </section>

            {/* Mobility */}
            {job?.mobility ? (
              <section className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
                <h2 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">
                  Mobility
                </h2>
                <p className="text-sm text-slate-700">{job.mobility}</p>
              </section>
            ) : null}

            {/* Compensation */}
            {job?.compensation && String(job.compensation).trim().length > 0 ? (
              <section className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
                <h2 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">
                  Compensation
                </h2>
                <p className="text-sm text-slate-700">{job.compensation}</p>
              </section>
            ) : null}

            {/* Alert Preferences */}
            {Array.isArray(job?.alert_preferences) &&
            job.alert_preferences.length > 0 ? (
              <section className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
                <h2 className="mb-3 text-lg font-semibold tracking-tight text-slate-900">
                  Alert Preferences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.alert_preferences.map((alert: any, idx: number) => (
                    <Chip key={`alert-${idx}`}>{alert}</Chip>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Right: Sticky apply + similar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 lg:space-y-6">
              {/* Apply Card */}
              {/* <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">
                  Ready to apply?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Submit your application in seconds.
                </p>
                <div className="mt-4">
                  <OauthApply job={job} jobID={job._id}>
                    <Button className="w-full rounded-xl px-5 py-2.5">
                      Apply Now
                    </Button>
                  </OauthApply>
                </div>
              </div> */}

              {/* Similar Jobs */}
              <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
                <SimilarJobs similarJobs={similarJobs} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
