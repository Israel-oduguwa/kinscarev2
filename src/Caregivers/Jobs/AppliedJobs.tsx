/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useApiClient } from "@/hooks/useApiClient";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { JobCardSkeleton } from "./JobCardSkeleton";
import Image from "next/image";
import dayjs from "dayjs"; // For date formatting, optional

interface Contact {
  address?: string;
  city?: string;
  zipcode?: string;
  state?: string;
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
  userID?: string;
}

type ApplicationStatus = "applied" | "interested" | "interviewed" | "hired";

type AppliedApplication = {
  jobId: string;
  appliedOn: string;
  provider: string;
  providerID: string;
  title: string;
  status: ApplicationStatus;
  statusUpdatedAt?: string;
  email?: string;
  referral?: boolean;
  providerProfile?: {
    userID?: string;
    name?: string;
    profileImage?: string;
  };
  job: Job;
};

const statusLabel: Record<ApplicationStatus, string> = {
  applied: "Applied",
  interested: "Interested",
  interviewed: "Interviewed",
  hired: "Hired",
};

const statusStyles: Record<ApplicationStatus, string> = {
  applied: "bg-slate-100 text-slate-700 ring-slate-200",
  interested: "bg-blue-50 text-blue-700 ring-blue-100",
  interviewed: "bg-amber-50 text-amber-700 ring-amber-100",
  hired: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const normalizeStatus = (status?: string): ApplicationStatus => {
  if (status === "interested" || status === "interviewed" || status === "hired") {
    return status;
  }
  return "applied";
};

function ReferralApplicationStatus({
  applications,
}: {
  applications: AppliedApplication[];
}) {
  // Filter for all referral applications (if you want to show all, not just first)
  const referralApps = (applications || []).filter(
    (a) => a.referral === true
  );

  if (!referralApps.length) return null;

  return (
    <section className="my-10 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        Referral
      </p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">
        Your Referral Applications
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        These were submitted through a referral and will be visible once the
        provider claims the job.
      </p>
      <div className="mt-5 space-y-5">
        {referralApps.map((app: any, idx: number) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/90 px-5 py-4 shadow-sm"
          >
            <div className="shrink-0 mt-1">
              <span className="inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 w-8 h-8">
                <Info className="w-5 h-5" />
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                <span className="text-base font-semibold text-slate-900">
                  {app.title || app.job?.title || "Referred Job"}
                </span>
                {app.appliedOn && (
                  <span className="text-xs text-slate-500 sm:ml-3">
                    {dayjs(app.appliedOn).format("MMM D, YYYY")}
                  </span>
                )}
              </div>
              <span className="block text-sm text-slate-600 mb-1">
                Provider:{" "}
                <span className="font-medium text-slate-900">
                  {app.provider || app.providerProfile?.name}
                </span>
              </span>
              <div className="flex flex-wrap gap-2 mb-1">
                {/* Show licenses and availability if available */}
                {Array.isArray(app.job?.licenses) &&
                  app.job.licenses.map((lic: any, i: number) => (
                    <span
                      key={i}
                      className="bg-slate-100 text-xs rounded-full px-2 py-0.5 text-slate-700"
                    >
                      {lic}
                    </span>
                  ))}
                {Array.isArray(app.job?.schedule) &&
                  app.job.schedule.map((av: any, i: number) => (
                    <span
                      key={i}
                      className="bg-slate-50 text-xs rounded-full px-2 py-0.5 text-slate-500"
                    >
                      {av}
                    </span>
                  ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                This application was submitted through a referral. You’ll be
                notified as soon as the provider claims the job and can review
                your application.
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <span className="text-xs text-slate-500">
          <em>
            Your applications are safe and visible to providers once they
            finalize their job posts. No extra steps needed.
          </em>
        </span>
      </div>
    </section>
  );
}

const AppliedJobCard: React.FC<{ application: AppliedApplication }> = ({
  application,
}) => {
  const job = application.job;
  const status = normalizeStatus(application.status);
  const providerName =
    application.provider || application.providerProfile?.name || job.provider;
  const providerId =
    application.providerID || application.providerProfile?.userID || job.userID;
  const providerLogo =
    application.providerProfile?.profileImage || job.profileImage;
  const locationLine = [job.contacts?.city, job.contacts?.state]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {providerLogo && (
              <Image
                width={48}
                height={48}
                className="h-12 w-12 rounded-2xl object-cover"
                src={providerLogo}
                alt="provider logo"
              />
            )}
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Applied job
              </p>
              <Link
                href={`/vitae/jobs/${job._id}`}
                className="mt-2 block text-lg font-semibold text-slate-900 hover:text-blue-700"
              >
                {job.title}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>{providerName}</span>
                {locationLine && (
                  <span className="text-slate-400">•</span>
                )}
                {locationLine && <span>{locationLine}</span>}
              </div>
              {application.email && (
                <p className="mt-1 text-xs text-slate-500">
                  {application.email}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                    statusStyles[status],
                  ].join(" ")}
                >
                  {statusLabel[status]}
                </span>
                {application.statusUpdatedAt ? (
                  <span className="text-xs text-slate-500">
                    Updated {dayjs(application.statusUpdatedAt).format("MMM D")}
                  </span>
                ) : null}
                {application.appliedOn ? (
                  <span className="text-xs text-slate-500">
                    Applied {dayjs(application.appliedOn).format("MMM D")}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {job?.licenses?.map((license, index) => (
              <span
                key={index}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {license}
              </span>
            ))}
            {job?.schedule?.map((sch, index) => (
              <span
                key={index}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {sch}
              </span>
            ))}
            {job?.minHours ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                Min {job.minHours} hrs / week
              </span>
            ) : null}
            {job?.compensation ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                ${job.compensation}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[180px]">
          <Link href={`/vitae/jobs/${job._id}`}>
            <Button className="w-full rounded-full bg-blue-600 text-white hover:bg-blue-700">
              View job
            </Button>
          </Link>
          {/* {providerId ? (
            <Link href={`/vitae/provider/${providerId}`}>
              <Button
                variant="outline"
                className="w-full rounded-full border-slate-200 bg-white/80"
              >
                Provider profile
              </Button>
            </Link>
          ) : null} */}
        </div>
      </div>
    </div>
  );
};
function AppliedJobs() {
  const authData: any = useAuthContext();
  const { contactData } = authData;
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<AppliedApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { privateApi } = useApiClient();
  // console.log(userData);
  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!contactData?.userID) return;
      const { data }: any = await privateApi.get(
        `/api/v1/caregivers/jobs/applied-job-status/${contactData.userID}`,
        { params: { page: 1, limit: 20 } }
      );
      setApplications(data.applications || []);
    } catch (error) {
      setError("Unable to load applied jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJob();
  }, [contactData]);
  // console.log(jobs);
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 px-4 py-8 md:px-6 2xl:px-0">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_10%_-10%,rgba(59,130,246,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_10%,rgba(37,99,235,0.12),transparent_60%)]" />
        <div className="absolute -top-28 right-12 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute -bottom-32 left-6 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
      </div>
      <div className="relative mx-auto px-6 max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Applications
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-[family:var(--header-font)] font-extrabold text-slate-900">
              Applied jobs
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Track each application and view the provider’s job and profile.
            </p>
          </div>
          <Link href="/vitae/jobs/all">
            <Button variant="ghost" className="rounded-full">
              <ChevronLeft size={18} /> Back to search jobs
            </Button>
          </Link>
        </div>
        {loading && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <JobCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        )}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
        {!loading && !error && applications.length === 0 && (
          <div className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-slate-600 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            You have not applied to any jobs yet.
          </div>
        )}
        <div className="mt-6 space-y-6">
          {applications.map((application) => (
            <AppliedJobCard
              key={`${application.jobId}-${application.appliedOn}`}
              application={application}
            />
          ))}
        </div>
        <ReferralApplicationStatus applications={applications} />
      </div>
    </div>
  );
}

export default AppliedJobs;
