"use client";

import React from "react";
import Link from "next/link";
import { Interweave } from "interweave";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Clock,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";

import JobListingLogo from "@/components/JobListingLogo";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";
import { useAuthContext } from "@/context/AuthContext";
import SendReferralEmail from "@/Caregivers/DashBoard/SendReferralEmail";

import OauthApply from "./OauthApply";

const CTA_INTERVAL = 4;

const CHIP_LIMITS = {
  licenses: { mobile: 1, desktop: 6 },
  schedule: { mobile: 1, desktop: 6 },
};

const chipVisibility = (
  index: number,
  mobileLimit: number,
  desktopLimit: number
) => {
  if (index < mobileLimit) return "";
  if (index < desktopLimit) return "hidden sm:inline-flex";
  return "hidden";
};

const Chip: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ${
      className || ""
    }`}
  >
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
      className="group relative w-full rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)] transition-all hover:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.38)] focus-within:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.38)]"
      role="article"
    >
      <div className="absolute inset-0 -z-10 rounded-3xl opacity-0 ring-2 ring-blue-500/0 transition group-hover:opacity-100 group-hover:ring-blue-500/10" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <Link
          href={`/jobs/${job._id}`}
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
              <h2 className="text md:text-lg font-semibold tracking-tight text-slate-900">
                {job?.title}
              </h2>
              {Array.isArray(job?.licenses) && job.licenses.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {job.licenses[0]}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{locationLine || "-"}</span>
            </div>

            {job.certifications && job.certifications.length > 0 && (
              <div className="mt-0 text-sm text-slate-700 line-clamp-2">
                <Interweave content={job?.certifications ?? ""} />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {Array.isArray(job?.licenses) &&
                job.licenses.map((license: string, i: number) => (
                  <Chip
                    key={`lic-${i}`}
                    className={chipVisibility(
                      i,
                      CHIP_LIMITS.licenses.mobile,
                      CHIP_LIMITS.licenses.desktop
                    )}
                  >
                    {license}
                  </Chip>
                ))}
              {Array.isArray(job?.schedule) &&
                job.schedule.map((sch: string, i: number) => (
                  <Chip
                    key={`sch-${i}`}
                    className={chipVisibility(
                      i,
                      CHIP_LIMITS.schedule.mobile,
                      CHIP_LIMITS.schedule.desktop
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {sch}
                  </Chip>
                ))}
              <Chip>
                Min Hours:{" "}
                <span className="ml-1 font-semibold">
                  {job?.minHours ?? "-"} / wk
                </span>
              </Chip>
            </div>
          </div>
        </Link>

        <div className="w-full lg:w-auto">
          <OauthApply publicPage={true} job={job} jobID={job?._id}>
            <Button className="w-full rounded-xl bg-blue-600 px-6 py-3 text-white shadow-[0_12px_28px_-14px_rgba(59,130,246,0.55)] transition hover:bg-blue-700 hover:shadow-[0_16px_32px_-14px_rgba(59,130,246,0.6)]">
              Join to apply
            </Button>
          </OauthApply>
        </div>
      </div>
    </div>
  );
};

const ExploreProgramsModal: React.FC = () => {
  const { closeDialog } = useDialog();

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />
            <div className="flex items-start md:items-center justify-between px-5 md:px-6 py-4">
              <div className="pr-10">
                <h2 className="text-white text-lg md:text-xl font-semibold tracking-tight">
                  Explore Programs
                </h2>
                <p className="text-slate-200 text-xs md:text-[13px]">
                  Compare programs and find the best-fit path for your next role.
                </p>
              </div>
              <button
                onClick={closeDialog}
                className="rounded-full p-2 z-50 text-white/90 hover:text-white hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 bg-slate-50/60">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Personalized program matches
                  </p>
                  <p className="text-xs text-slate-600">
                    We match programs to your goals, schedule, and location.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Compare
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  See tuition, format, and requirements side by side.
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Save
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Save programs to your career plan and return anytime.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                asChild
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Link href="/explore">Explore programs</Link>
              </Button>
              <Button variant="outline" onClick={closeDialog}>
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReferEmployerPrompt: React.FC = () => {
  const { closeDialog } = useDialog();

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="relative shrink-0 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />
            <div className="flex items-start md:items-center justify-between px-5 md:px-6 py-4">
              <div className="pr-10">
                <h2 className="text-white text-lg md:text-xl font-semibold tracking-tight">
                  Refer an Employer
                </h2>
                <p className="text-emerald-100 text-xs md:text-[13px]">
                  Sign in to send a referral and start earning points.
                </p>
              </div>
              <button
                onClick={closeDialog}
                className="rounded-full p-2 z-50 text-white/90 hover:text-white hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 bg-emerald-50/50">
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Invite a hiring contact
                  </p>
                  <p className="text-xs text-slate-600">
                    Sign in to email an employer or family and earn referral points.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Link href="/signin">Sign in to refer</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExploreProgramsCard: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <div
    className="group relative w-full rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)] transition-all hover:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.38)]"
    role="article"
  >
    <div className="absolute inset-0 -z-10 rounded-3xl opacity-0 ring-2 ring-blue-500/0 transition group-hover:opacity-100 group-hover:ring-blue-500/10" />
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Explore programs
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            Find programs that match your goals
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Compare nursing and allied health programs near you.
          </p>
        </div>
      </div>
      <Button onClick={onOpen} className="bg-blue-600 text-white hover:bg-blue-700">
        Explore programs
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);

const ReferEmployerCard: React.FC<{ onOpen: () => void; isSignedIn: boolean }> = ({
  onOpen,
  isSignedIn,
}) => (
  <div
    className="group relative w-full rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)] transition-all hover:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.38)]"
    role="article"
  >
    <div className="absolute inset-0 -z-10 rounded-3xl opacity-0 ring-2 ring-emerald-500/0 transition group-hover:opacity-100 group-hover:ring-emerald-500/10" />
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Refer employer
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            Know someone hiring caregivers?
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Send a referral and earn points when they engage.
          </p>
        </div>
      </div>
      <Button onClick={onOpen} className="bg-emerald-600 text-white hover:bg-emerald-700">
        {isSignedIn ? "Refer employer" : "Sign in to refer"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);

type JobOpeningsListProps = {
  jobs: any[];
  mode: string;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  prevHref: string;
  nextHref: string;
};

const JobOpeningsList: React.FC<JobOpeningsListProps> = ({
  jobs,
  mode,
  currentPage,
  totalPages,
  hasMore,
  prevHref,
  nextHref,
}) => {
  const { openDialog } = useDialog();
  const { userData } = useAuthContext();
  const isSignedIn = Boolean(userData?.userID);

  const openExplorePrograms = () => openDialog(<ExploreProgramsModal />);
  const openReferEmployer = () =>
    openDialog(isSignedIn ? <SendReferralEmail /> : <ReferEmployerPrompt />);

  const interleavedJobs = jobs.flatMap((job: any, index: number) => {
    const items: React.ReactNode[] = [
      <JobPostCard key={`job-${job._id}`} job={job} />,
    ];
    if ((index + 1) % CTA_INTERVAL === 0) {
      const ctaIndex = Math.floor((index + 1) / CTA_INTERVAL);
      const showExplore = ctaIndex % 2 === 1;
      items.push(
        showExplore ? (
          <ExploreProgramsCard
            key={`cta-explore-${index}`}
            onOpen={openExplorePrograms}
          />
        ) : (
          <ReferEmployerCard
            key={`cta-refer-${index}`}
            onOpen={openReferEmployer}
            isSignedIn={isSignedIn}
          />
        )
      );
    }
    return items;
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-5">
        {jobs.length > 0 ? (
          interleavedJobs
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200/70 bg-white p-10 text-center shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)]">
            <div className="mx-auto mb-4 h-16 w-16 text-slate-300">
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
            <p className="text-sm text-slate-600">
              No jobs found for the selected filters.
            </p>
          </div>
        )}
      </div>

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
    </>
  );
};

export default JobOpeningsList;
