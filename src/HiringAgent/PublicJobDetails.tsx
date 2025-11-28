import { Interweave } from "interweave";
import { MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import { polyfill } from "interweave-ssr";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dynamic from "next/dynamic";
import ProviderApproveJobButton from "./ProviderApproveJobButton";

polyfill();

// Lazy-load client button (so this file stays a server component)

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
  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
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
        <p className="text-sm font-medium text-gray-800">Similar Jobs</p>
        <div className="mt-3 rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
          No similar jobs found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm antialiased font-medium text-gray-800">
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
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                  <p className="mb-1 truncate text-sm font-semibold text-gray-900">
                    {job?.title}
                  </p>
                  <p className="text-xs text-gray-600">{locationLine || "—"}</p>

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
async function PublicJobDetails({ jobID }: { jobID: string }) {
  const data = await fetch(
    `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/caregivers/job/${jobID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  const { job, similarJobs } = response;
  console.log(job)

  const locationLine = [
    job?.contacts?.address ?? "",
    job?.contacts?.city ?? "",
    job?.contacts?.zipcode ?? "",
  ]
    .filter(Boolean)
    .join(", ");

  const jobIdString =
    typeof job?._id === "string" ? job._id : job?._id?.toString?.() ?? "";

  console.log(job);
  const paymentLink = `https//kinscare.org/add-payment/${job?.agentMeta?.applicantId}`
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back & Title Row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"></div>

        {/* Header Card */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {job?.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  {job?.provider ? (
                    <span className="font-medium text-gray-800">
                      {job.provider}
                    </span>
                  ) : null}
                  {locationLine ? (
                    <>
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

            {/* Provider "Accept Job Post" button */}
            <div className="w-full max-w-xs">
              {!job.approved ? (
                <ProviderApproveJobButton
                  initialApproved={job.status === "provider_approved"}
                  initialPaymentLink={paymentLink}
                  // existingAccount={job.existingAccount}
                  jobId={jobIdString}                 />
              ) : (
                <p  className="text-sm font-semibold">
                  Your Job is already approved, please contact kinscare agent for more details
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-1">
          {/* Left: Content */}
          <div className="lg:col-span-2">
            {/* About */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold tracking-tight text-gray-900">
                About this Role
              </h2>
              <div className="prose prose-sm max-w-none text-gray-800">
                <Interweave content={job?.description || "—"} />
              </div>

              {job?.certifications ? (
                <>
                  <div className="mt-6 h-px w-full bg-gray-100" />
                  <h3 className="mt-6 mb-3 text-base font-semibold text-gray-900">
                    Requirements &amp; Certifications
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <Interweave content={job.certifications} />
                  </div>
                </>
              ) : null}
            </section>

            {/* Mobility */}
            {job?.mobility ? (
              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-lg font-semibold tracking-tight text-gray-900">
                  Mobility
                </h2>
                <p className="text-sm text-gray-700">{job.mobility}</p>
              </section>
            ) : null}

            {/* Compensation */}
            {job?.compensation && String(job.compensation).trim().length > 0 ? (
              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-lg font-semibold tracking-tight text-gray-900">
                  Compensation
                </h2>
                <p className="text-sm text-gray-700">{job.compensation}</p>
              </section>
            ) : null}

            {/* Alert Preferences */}
            {Array.isArray(job?.alert_preferences) &&
            job.alert_preferences.length > 0 ? (
              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold tracking-tight text-gray-900">
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

          {/* Right: Sticky apply + similar (currently disabled) */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 lg:space-y-6">
              {/* Reserved for future side content, similar jobs, etc. */}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PublicJobDetails;
