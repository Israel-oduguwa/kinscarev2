import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, CheckCircle2, Loader2, Gauge } from "lucide-react";
import React from "react";
import AddWorkExperience from "../../AddWorkExperience";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";

function WorkExperienceUi({ userData }: any) {
  const { openDialog } = useDialog();

  const handleOpenDialog = () => {
    openDialog(<AddWorkExperience />);
  };

  // Loading skeleton (unchanged behavior)
  if (!userData) {
    return (
      <div className="relative min-h-[249px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-2 font-semibold text-gray-300">Add Your Work Experience</p>
        <Skeleton className="mb-3 h-[150px] w-full rounded-xl bg-slate-200" />
        <Skeleton className="h-[36px] w-full rounded-xl" />
      </div>
    );
  }

  // UI-only derived values
  const exp = userData?.careerProfile?.experience || {};
  const entries = Array.isArray(exp.workExperiences) ? exp.workExperiences.length : 0;
  const points = exp.points ?? 0;
  const maxPoints = 40; // visual reference only (25 + 10 + 5)
  const progress = Math.min(100, Math.round((points / maxPoints) * 100));

  // Status pill (pure display)
  const status: { label: string; className: string; icon?: React.ReactNode } = exp.hasCompleted
    ? {
        label: "Completed",
        className:
          "inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700",
        icon: <CheckCircle2 className="h-4 w-4" />,
      }
    : entries > 0
    ? {
        label: "In progress",
        className:
          "inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
      }
    : {
        label: "Not started",
        className:
          "inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600",
      };

  const ctaLabel = exp?.draft
    ? "Edit Work Experience"
    : exp?.hasCompleted
    ? "Edit Work Experience"
    : "Add Work Experience";

  return (
    <div className="relative min-h-[249px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold tracking-tight text-gray-900">Add work experience</p>
          <p className="mt-1 text-sm font-normal text-slate-600">
            Document relevant roles or volunteering to strengthen your application.
          </p>
        </div>
        {/* <span className={status.className}>
          {status.icon}
          {status.label}
        </span> */}
      </div>

      {/* Stat chips */}
      {/* <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <Briefcase className="h-4 w-4 text-indigo-600" />
          Entries <span className="font-medium text-gray-900">{entries}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <Gauge className="h-4 w-4 text-indigo-600" />
          Points <span className="font-medium text-gray-900">{points}</span>
        </span>
      </div> */}

      {/* Progress bar (visual only) */}
      <div className="mb-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          {points} / {maxPoints} points
        </p>
      </div>

      {/* CTA */}
      <Button variant="outline" onClick={handleOpenDialog} className="w-full sm:w-auto">
        {ctaLabel}
      </Button>
    </div>
  );
}

export default WorkExperienceUi;
