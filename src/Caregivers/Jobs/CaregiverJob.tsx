"use client";

import React from "react";
import ApplyNow from "./JobsUI/ApplyNow";
import {
  MapPin,
  ShieldCheck,
  DollarSign,
  Clock,
  Award,
  Users,
  Building2,
} from "lucide-react";
import { Interweave } from "interweave";
import Link from "next/link";
import Image from "next/image";
import { useApiClient } from "@/hooks/useApiClient";

interface JobProps {
  jobID: string;
}

const VerifiedBadge = ({ verified }: { verified?: boolean }) => {
  if (!verified) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-emerald-600">
      <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 rounded-full">
        <ShieldCheck size={12} />
      </div>
      Verified employer
    </div>
  );
};

const StatPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="text-center p-4">
    <div className="flex justify-center mb-2">
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon size={18} className="text-gray-600" />
      </div>
    </div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

const SimilarJobs = ({ similarJobs }: any) => {
  return (
    <div className="w-full">
      <p className="text-sm antialiased font-semibold">Similar Jobs</p>
      {similarJobs.map((job: any) => (
        <Link key={job._id} href={`/vitae/jobs/${job._id}`}>
          <div className="mt-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-center gap-3">
                {job.profileImage && (
                  <Image
                    width={40}
                    height={40}
                    className="h-8 w-8 rounded-md object-cover"
                    src={job.profileImage}
                    alt="company logo"
                  />
                )}
                <div className="min-w-0">
                  <p className="mb-1 line-clamp-1 text-sm font-medium text-gray-900">
                    {job.title}
                  </p>
                  <p className="text-xs font-normal text-gray-600">
                    {job.contacts?.zipcode}, {job.contacts?.city}
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2">
                {Array.isArray(job.licenses) &&
                  job.licenses
                    .slice(0, 2)
                    .map((license: any, idx: React.Key) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {license}
                      </span>
                    ))}
                {Array.isArray(job.schedule) &&
                  job.schedule.slice(0, 2).map((sch: any, idx: React.Key) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                      {sch}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default function CaregiverJob({ jobID }: JobProps) {
  const { privateApi } = useApiClient();

  const [job, setJob] = React.useState<any>(null);
  const [similarJobs, setSimilarJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadJob() {
      try {
        const res = await privateApi.get(`/api/v1/caregivers/job/${jobID}`);
        const { job, similarJobs } = res.data;

        setJob(job);
        setSimilarJobs(similarJobs);
      } catch (error) {
        console.error("Error loading job:", error);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobID, privateApi]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-linear-to-b from-slate-50 via-slate-50 to-slate-100 py-8 px-4 md:px-6 2xl:px-0">
      <div className="pointer-events-none absolute inset-0">
        {/* <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_10%_-10%,rgba(59,130,246,0.12),transparent_55%)]" /> */}
        {/* <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_10%,rgba(37,99,235,0.12),transparent_60%)]" /> */}
        <div className="absolute -top-28 right-12 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute -bottom-32 left-6 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Job overview
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-[family:var(--header-font)] font-extrabold text-slate-900">
            Role details
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Review the role, requirements, and application details.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  {job.profileImage && (
                    <Image
                      width={72}
                      height={72}
                      className="h-16 w-16 rounded-2xl object-cover"
                      src={job.profileImage}
                      alt="Company logo"
                    />
                  )}
                  <div className="flex-1">
                    <VerifiedBadge verified={job?.verified} />
                    <h2 className="mt-2 text-3xl font-[family:var(--header-font)] font-extrabold text-slate-900 leading-tight">
                      {job.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <Building2 size={18} />
                        {job.provider}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={18} />
                        {job.contacts?.city}, {job.contacts?.state}
                      </span>
                    </div>
                    {job.contacts?.address && (
                      <p className="mt-2 text-sm text-slate-500">
                        {job.contacts.address}
                        {job.contacts?.zipcode
                          ? ` • ${job.contacts.zipcode}`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {job.compensation && (
                    <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
                      <StatPill
                        icon={DollarSign}
                        label="Compensation"
                        value={job.compensation}
                      />
                    </div>
                  )}
                  {job.schedule?.[0] && (
                    <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
                      <StatPill
                        icon={Clock}
                        label="Schedule"
                        value={job.schedule[0]}
                      />
                    </div>
                  )}
                  {job.licenses?.[0] && (
                    <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
                      <StatPill
                        icon={Award}
                        label="License"
                        value={job.licenses[0]}
                      />
                    </div>
                  )}
                  {job.alert_preferences?.[0] && (
                    <div className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
                      <StatPill
                        icon={Users}
                        label="Preference"
                        value={job.alert_preferences[0]}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Highlights
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                Job highlights
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Key requirements and schedule details at a glance.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job?.licenses?.slice(0, 6).map((license: any, idx: any) => (
                  <span
                    key={idx}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {license}
                  </span>
                ))}
                {job?.schedule?.slice(0, 6).map((sch: any, idx: any) => (
                  <span
                    key={idx}
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
                {job?.mobility ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Mobility: {job.mobility}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Overview
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                About this role
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Learn about the responsibilities and certifications needed.
              </p>
              <div className="prose-sm mt-4 leading-relaxed text-slate-700">
                <Interweave content={job.description} />
              </div>
              {job.certifications && (
                <div className="prose-sm mt-4 leading-relaxed text-slate-700">
                  <Interweave content={job.certifications} />
                </div>
              )}
            </div>

            {job.alert_preferences && (
              <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Preferences
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Alert preferences
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Preferred caregiver experience and requirements.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.alert_preferences.map((alert: any, idx: any) => (
                    <span
                      key={idx}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {alert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur lg:sticky lg:top-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Apply
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Ready to apply?
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Your application goes directly to the provider.
              </p>
              <div className="mt-4">
                <ApplyNow job={job} jobID={jobID} />
              </div>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Explore
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                Similar roles
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                More openings you might like.
              </p>
              <div className="mt-4">
                <SimilarJobs similarJobs={similarJobs} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
