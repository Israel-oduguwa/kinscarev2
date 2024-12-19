import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCheck, PencilLine } from "lucide-react";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Assuming you use a Dialog component
import AddWorkExperience from "../../AddWorkExperience"; // Placeholder for the dialog's content
import { useDialog } from "@/Caregivers/CaregiverContext/DialogProvider";

function WorkExperienceUi({ userData }: any) {
  const { openDialog } = useDialog();
  
    const handleOpenDialog = () => {
      openDialog(<AddWorkExperience/>);
    };
  // Before the userData loads
  if (!userData) {
    return (
      <div className="shadow-sm border min-h-[249px] p-6 bg-white border-zinc-50 relative rounded-xl">
        <p className="antialiased font-semibold mb-2 text-gray-300">
          Add Your Work Experience
        </p>
        <Skeleton className="h-[150px] w-full bg-slate-200 rounded-xl mb-3" />
        <Skeleton className="h-[30px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <>
      {/* Main UI */}
      <div className="shadow-md border min-h-[249px] bg-white border-zinc-50 relative rounded-xl">
      
        <div className="p-6 flex flex-col space-y-6">
          <div>
            <p className="text-xl tracking-tight font-bold antialiased mb-1 text-gray-900">
              Add work experience
            </p>
            <div className="mb-2">
              <p className="text-sm text-slate-600 antialiased">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Ducimus explicabo qui dolorem ratione laboriosam quos
                praesentium culpa. Cumque,
              </p>
            </div>
            <div className="flex justify-between text-sm items-center">
              {/* Placeholder for any points or extra info */}
            </div>
          </div>
          <Button variant="outline" onClick={handleOpenDialog}>
            {userData?.careerProfile?.experience?.draft ? (
              "Edit Work Experience"
            ) : (
              <>
                {userData?.careerProfile?.experience?.hasCompleted
                  ? "Edit Work Experience"
                  : "Add Work Experience"}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

export default WorkExperienceUi;


// {userData?.careerProfile?.experience?.hasCompleted ? (
//   <span className="bg-green-100 p-2 text-xs shadow-lg shadow-green-50 text-green-700 font-semibold rounded-md absolute -top-4 -right-2 flex space-x-1 items-center">
//     <CheckCheck size={18} className="mr-1" color="#008a35" />
//   </span>
// ) : (
//   <>
//     {userData?.careerProfile?.experience?.draft && (
//       <span className="bg-green-100 p-3 text-xs shadow-lg shadow-green-50 text-green-700 font-semibold rounded-md absolute -top-4 -right-2 flex space-x-1 items-center">
//         <PencilLine size={18} className="mr-2" color="#c4ad17" />
//         Editing
//       </span>
//     )}
//   </>
// )}