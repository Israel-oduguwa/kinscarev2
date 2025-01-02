import React, { Suspense } from "react";
import CaregiverJob from "@/Caregivers/Jobs/CaregiverJob";
import { Skeleton } from "@/components/ui/skeleton";
const CandidateDetailsSkeleton = () => {
  return (
    <div className="bg-gray-100 ">
      <div className="mx-auto max-w-6xl py-10 p-6 space-y-4">
        {/* Profile Section Skeleton */}
        <div className="relative shadow-sm border bg-white border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex flex-col space-y-2">
              <Skeleton className="w-48 h-6 rounded" />
              <Skeleton className="w-32 h-4 rounded" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Skeleton className="w-16 h-6 rounded" />
            <Skeleton className="w-20 h-6 rounded" />
            <Skeleton className="w-12 h-6 rounded" />
          </div>
          <div className="space-y-2 mt-6">
            <Skeleton className="w-32 h-6 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-3/4 h-4 rounded" />
          </div>
          <div className="space-y-2 mt-6">
            <Skeleton className="w-32 h-6 rounded" />
            <Skeleton className="w-full h-4 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="w-32 h-6 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="shadow-sm border bg-white border-gray-200 rounded-lg p-4 space-y-4"
              >
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <Skeleton className="w-3/4 h-4 rounded mx-auto" />
                <Skeleton className="w-1/2 h-4 rounded mx-auto" />
                <Skeleton className="w-full h-6 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <Suspense
      fallback={
       <CandidateDetailsSkeleton/>
      }
    >
      <CaregiverJob jobID={id} />
    </Suspense>
  );
}

export default page;
