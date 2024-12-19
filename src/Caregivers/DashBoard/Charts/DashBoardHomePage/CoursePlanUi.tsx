import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";
import AddCoursePlan from "../../AddCoursePlan";

function CoursePlanUi({ userData }: any) {
  const { openDialog } = useDialog();

  const handleOpenDialog = () => {
    openDialog(<AddCoursePlan />);
  };

  if (!userData) {
    return (
      <div className="shadow-sm border p-6 bg-white min-h-[249px] border-zinc-50 relative rounded-xl">
        <p className="antialiased font-semibold mb-2 text-gray-300">
          Create course plan
        </p>
        <Skeleton className="h-[150px] w-full bg-slate-200 rounded-xl mb-3" />
        <Skeleton className="h-[30px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="shadow-md border bg-white border-zinc-50 relative min-h-[249px] rounded-xl">
      <div className="p-6 flex flex-col space-y-6">
        <div>
          <p className="text-xl tracking-tight font-bold mb-1 text-gray-900">
            Create course plan
          </p>
          <p className="text-sm text-slate-600 antialiased font-normal">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ducimus
            explicabo qui dolorem ratione laboriosam quos praesentium culpa.
            Cumque,
          </p>
        </div>
        <Button variant="outline" onClick={handleOpenDialog}>
          {userData?.careerProfile?.coursePlan?.draft ||
          userData?.careerProfile?.coursePlan?.hasCompleted
            ? "Edit Course Plan"
            : "Add Course Plan"}
        </Button>
      </div>
    </div>
  );
}

export default CoursePlanUi;
