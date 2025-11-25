import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";
import AddCoursePlan from "../../AddCoursePlan";
import { ShieldCheck, Layers, ClipboardList, CheckCircle2, Loader2 } from "lucide-react";

function CoursePlanUi({ userData }: any) {
  const { openDialog } = useDialog();

  const handleOpenDialog = () => {
    openDialog(<AddCoursePlan />);
  };

  // Loading skeleton (unchanged behavior)
  if (!userData) {
    return (
      <div className="relative min-h-[249px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-2 font-semibold text-gray-300">Create course plan</p>
        <Skeleton className="mb-3 h-[150px] w-full rounded-xl bg-slate-200" />
        <Skeleton className="h-[36px] w-full rounded-xl" />
      </div>
    );
  }

  // UI-only derived values (purely visual)
  const cp = userData?.careerProfile?.coursePlan || {};
  const points = cp.points ?? 0;
  const maxPoints = 65; // 15 (licenses) + 35 (prereq) + 15 (req)
  const progress = Math.min(100, Math.round((points / maxPoints) * 100));

  const licenses = Array.isArray(cp.licenses) ? cp.licenses.length : 0;
  const prereq = Array.isArray(cp.prerequisite) ? cp.prerequisite.length : 0;
  const reqs = Array.isArray(cp.requirement) ? cp.requirement.length : 0;

  const status: { label: string; className: string; icon?: React.ReactNode } = cp.hasCompleted
    ? {
        label: "Completed",
        className:
          "inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700",
        icon: <CheckCircle2 className="h-4 w-4" />,
      }
    : licenses || prereq || reqs
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

  const ctaLabel =
    cp?.draft || cp?.hasCompleted ? "Edit Course Plan" : "Add Course Plan";

  return (
    <div className="relative min-h-[249px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold tracking-tight text-gray-900">
            Create course plan
          </p>
          <p className="mt-1 text-sm font-normal text-slate-600">
            Create a course plan and track your licenses, prerequisites, and requirements to stay eligible.
          </p>
        </div>
        {/* <span className={status.className}>
          {status.icon}
          {status.label}
        </span> */}
      </div>

      {/* Stat chips */}
      {/* <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <span className="text-sm text-gray-700">
            Licenses <span className="font-medium text-gray-900">{licenses}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
          <Layers className="h-4 w-4 text-indigo-600" />
          <span className="text-sm text-gray-700">
            Prerequisites <span className="font-medium text-gray-900">{prereq}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
          <ClipboardList className="h-4 w-4 text-indigo-600" />
          <span className="text-sm text-gray-700">
            Requirements <span className="font-medium text-gray-900">{reqs}</span>
          </span>
        </div>
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

export default CoursePlanUi;
