"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import ProfileAvatar from "@/components/ProfileAvatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ApplicantStatus = "applied" | "interested" | "interviewed" | "hired";

type Applicant = {
  appliedOn: string;
  status?: ApplicantStatus;
  statusUpdatedAt?: string;
  caregiverId: string;
  caregiverName: string;
  availability: string[];
  licenses: string[];
  caregiver: {
    userID: string;
    fname: string;
    lname: string;
    profileImage?: string;
    city?: string;
    zipcode?: string;
    email?: string;
  };
};

type ApplicationGroup = {
  jobId: string;
  jobTitle: string;
  jobCreated: string;
  latestAppliedOn: string;
  applicants: Applicant[];
};

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
    {children}
  </span>
);

const statusLabel: Record<ApplicantStatus, string> = {
  applied: "Applied",
  interested: "Interested",
  interviewed: "Interviewed",
  hired: "Hired",
};

const statusStyles: Record<ApplicantStatus, string> = {
  applied: "bg-slate-100 text-slate-700 ring-slate-200",
  interested: "bg-blue-50 text-blue-700 ring-blue-100",
  interviewed: "bg-amber-50 text-amber-700 ring-amber-100",
  hired: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const normalizeStatus = (status?: string): ApplicantStatus => {
  if (
    status === "interested" ||
    status === "interviewed" ||
    status === "hired"
  ) {
    return status;
  }
  return "applied";
};

const ProviderApplications = () => {
  const { userData } = useAuthContext() as any;
  const { privateApi } = useApiClient();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") || undefined;

  const [applications, setApplications] = useState<ApplicationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [pendingAction, setPendingAction] = useState<{
    jobId: string;
    caregiverId: string;
    caregiverName: string;
    jobTitle: string;
    status: ApplicantStatus;
  } | null>(null);

  const providerUserId = userData?.userID;

  useEffect(() => {
    if (!providerUserId) return;
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const { data } = await privateApi.get(
          `/api/v1/providers/job-applications/${providerUserId}`,
          {
            params: {
              page,
              limit: 20,
              ...(jobId ? { jobId } : {}),
            },
          }
        );
        setApplications(data?.applications || []);
        setPages(data?.pagination?.pages || 1);
        setTotal(data?.pagination?.total || 0);
        setError(null);
      } catch (err: any) {
        setError("Unable to load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [privateApi, providerUserId, page, jobId]);

  const updateApplicantStatus = async (
    jobId: string,
    caregiverId: string,
    caregiverName: string,
    nextStatus: ApplicantStatus
  ) => {
    if (!providerUserId) return;
    const key = `${jobId}-${caregiverId}`;
    setUpdating((prev) => ({ ...prev, [key]: true }));
    try {
      const { data } = await privateApi.post(
        `/api/v1/providers/job-applications/${providerUserId}/status`,
        { jobId, caregiverId, status: nextStatus }
      );
      const resolvedStatus = normalizeStatus(data?.status || nextStatus);
      setApplications((prev) =>
        prev.map((group) =>
          group.jobId !== jobId
            ? group
            : {
                ...group,
                applicants: group.applicants.map((applicant) =>
                  applicant.caregiverId !== caregiverId
                    ? applicant
                    : {
                        ...applicant,
                        status: resolvedStatus,
                        statusUpdatedAt: new Date().toISOString(),
                      }
                ),
              }
        )
      );
      toast({
        title: "Application status updated.",
        description: `${caregiverName} marked as ${statusLabel[
          resolvedStatus
        ].toLowerCase()}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Unable to update status. Please try again.",
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [key]: false }));
    }
  };

  const headerCopy = useMemo(() => {
    if (jobId) {
      return "Applications for this job posting";
    }
    return "Review applicants across your active job postings";
  }, [jobId]);

  return (
    <div className="min-h-screen bg-slate-950/5 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Provider dashboard
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-[family:var(--header-font)] font-extrabold text-slate-900">
            Applications
          </h1>
          <p className="mt-2 text-sm text-slate-600">{headerCopy}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
              Total applications: {total}
            </span>
            {jobId ? (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-700">
                Job filter active
              </span>
            ) : null}
          </div>
        </div>
        <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-900 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.35)]">
          <p className="font-semibold">How status updates work</p>
          <p className="mt-1 text-blue-800/80">
            Please use Mark Interviewed and Mark Hired after you’ve already
            spoken with the caregiver. Status updates send in-app
            notifications, and SMS is sent for Interested and Hired.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/80 px-3 py-1 text-blue-900">
              Applied → Interested → Interviewed → Hired
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-blue-900">
              Interested + Hired send SMS
            </span>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]"
              >
                <Skeleton className="h-6 w-2/3" />
                <div className="mt-4 grid gap-3">
                  {Array.from({ length: 2 }).map((__, subIdx) => (
                    <Skeleton key={subIdx} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && applications.length === 0 && (
          <div className="rounded-3xl border border-white/70 bg-white/80 p-10 text-center shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]">
            <p className="text-slate-600">
              No applications yet. Share your job post to attract caregivers.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          applications.map((group) => (
            <div
              key={group.jobId}
              className="mb-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {group.jobTitle}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Posted{" "}
                    {formatDistanceToNow(new Date(group.jobCreated), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  Latest applicant{" "}
                  {formatDistanceToNow(new Date(group.latestAppliedOn), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {group.applicants.map((applicant) => {
                  const caregiver = applicant.caregiver || {};
                  const caregiverDisplayName =
                    [caregiver.fname, caregiver.lname]
                      .filter(Boolean)
                      .join(" ") ||
                    applicant.caregiverName ||
                    "Applicant";
                  const status = normalizeStatus(applicant.status);
                  const statusUpdatedAt =
                    applicant.statusUpdatedAt || applicant.appliedOn;
                  const key = `${group.jobId}-${applicant.caregiverId}`;
                  const isUpdating = Boolean(updating[key]);
                  return (
                    <div
                      key={`${group.jobId}-${applicant.caregiverId}-${applicant.appliedOn}`}
                      className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <ProfileAvatar
                          size="w-12 h-12"
                          name={`${caregiver.fname || ""} ${
                            caregiver.lname || ""
                          }`}
                          profileImage={caregiver.profileImage}
                        />
                        <div>
                          <Link
                            href={`/provider/candidates/${caregiver.userID}`}
                            className=" font-semibold text-slate-900 hover:text-blue-700"
                          >
                            {caregiver.fname} {caregiver.lname}
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>
                              {caregiver.city || "—"} {caregiver.zipcode || ""}
                            </span>
                          </div>
                          {caregiver.email ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {caregiver.email}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 md:items-end">
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          {applicant.licenses?.map((license) => (
                            <Chip key={`${applicant.caregiverId}-${license}`}>
                              {license}
                            </Chip>
                          ))}
                          {applicant.availability?.map((slot) => (
                            <Chip key={`${applicant.caregiverId}-${slot}`}>
                              {slot}
                            </Chip>
                          ))}
                          <Chip>
                            Applied{" "}
                            {formatDistanceToNow(
                              new Date(applicant.appliedOn),
                              {
                                addSuffix: true,
                              }
                            )}
                          </Chip>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                              statusStyles[status],
                            ].join(" ")}
                          >
                            {statusLabel[status]}
                          </span>
                          {statusUpdatedAt ? (
                            <span className="text-xs text-slate-500">
                              Updated{" "}
                              {formatDistanceToNow(new Date(statusUpdatedAt), {
                                addSuffix: true,
                              })}
                            </span>
                          ) : null}
                          {status === "applied" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 text-white hover:bg-blue-700"
                              disabled={isUpdating}
                              onClick={() =>
                                setPendingAction({
                                  jobId: group.jobId,
                                  caregiverId: applicant.caregiverId,
                                  caregiverName: caregiverDisplayName,
                                  jobTitle: group.jobTitle,
                                  status: "interested",
                                })
                              }
                            >
                              {isUpdating ? "Updating..." : "Mark Interested"}
                            </Button>
                          )}
                          {status === "interested" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdating}
                                onClick={() =>
                                  setPendingAction({
                                    jobId: group.jobId,
                                    caregiverId: applicant.caregiverId,
                                    caregiverName: caregiverDisplayName,
                                    jobTitle: group.jobTitle,
                                    status: "interviewed",
                                  })
                                }
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : "Mark Interviewed"}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                disabled={isUpdating}
                                onClick={() =>
                                  setPendingAction({
                                    jobId: group.jobId,
                                    caregiverId: applicant.caregiverId,
                                    caregiverName: caregiverDisplayName,
                                    jobTitle: group.jobTitle,
                                    status: "hired",
                                  })
                                }
                              >
                                {isUpdating ? "Updating..." : "Mark Hired"}
                              </Button>
                            </>
                          )}
                          {status === "interviewed" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                              disabled={isUpdating}
                              onClick={() =>
                                setPendingAction({
                                  jobId: group.jobId,
                                  caregiverId: applicant.caregiverId,
                                  caregiverName: caregiverDisplayName,
                                  jobTitle: group.jobTitle,
                                  status: "hired",
                                })
                              }
                            >
                              {isUpdating ? "Updating..." : "Mark Hired"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {!loading && !error && pages > 1 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="w-full rounded-xl border border-slate-200 bg-white/80 sm:w-auto"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <div className="text-sm text-slate-600">
              Page {page} of {pages}
            </div>
            <Button
              className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
              disabled={page >= pages}
              onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status update</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction
                ? `Mark ${pendingAction.caregiverName} as ${
                    statusLabel[pendingAction.status]
                  } for "${pendingAction.jobTitle}"?`
                : "Confirm status update."}
              {pendingAction?.status === "interested" ||
              pendingAction?.status === "hired"
                ? " This will send an in-app notification and an SMS."
                : " This will send an in-app notification."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingAction) return;
                updateApplicantStatus(
                  pendingAction.jobId,
                  pendingAction.caregiverId,
                  pendingAction.caregiverName,
                  pendingAction.status
                );
                setPendingAction(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProviderApplications;
