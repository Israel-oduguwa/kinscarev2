import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const JobDetailSkeleton = () => {
  return (
    <div className="max-w-6xl py-20 mx-auto p-4">
      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (Job Details) */}
        <div className="lg:col-span-2 w-full">
          {/* Job Title and Apply Button */}
          <div className="w-full mb-4">
            <div className="flex gap-4 flex-wrap items-center lg:flex-nowrap justify-between">
              <Skeleton className="w-2/3 h-8 rounded-lg" />
              <Skeleton className="w-24 h-8 rounded-lg" />
            </div>
          </div>

          {/* Provider Info and Tags */}
          <div className="mb-10">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="w-32 h-4 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="w-20 h-4 rounded-lg" />
                  <Skeleton className="w-16 h-4 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              <Skeleton className="w-16 h-6 rounded-lg" />
              <Skeleton className="w-20 h-6 rounded-lg" />
              <Skeleton className="w-12 h-6 rounded-lg" />
            </div>
          </div>

          {/* About This Role */}
          <div className="mb-4">
            <Skeleton className="w-40 h-6 rounded-lg mb-2" />
            <Skeleton className="w-full h-4 rounded-lg mb-2" />
            <Skeleton className="w-full h-4 rounded-lg mb-2" />
            <Skeleton className="w-2/3 h-4 rounded-lg mb-2" />
          </div>

          {/* Certifications */}
          <div className="text-sm text-gray-600 mb-4">
            <Skeleton className="w-32 h-6 rounded-lg mb-2" />
            <Skeleton className="w-full h-4 rounded-lg mb-2" />
            <Skeleton className="w-2/3 h-4 rounded-lg mb-2" />
          </div>

          {/* Compensation */}
          <div className="mb-4">
            <Skeleton className="w-40 h-6 rounded-lg mb-2" />
            <Skeleton className="w-24 h-4 rounded-lg" />
          </div>

          {/* Alert Preferences */}
          <div className="mb-4">
            <Skeleton className="w-40 h-6 rounded-lg mb-2" />
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="w-16 h-6 rounded-lg" />
              <Skeleton className="w-16 h-6 rounded-lg" />
              <Skeleton className="w-16 h-6 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar with Similar Jobs) */}
        <div>
          <Skeleton className="w-full h-8 rounded-lg mb-4" />
          <div className="flex flex-col gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-4 space-y-4"
              >
                <Skeleton className="w-32 h-6 rounded-lg mb-2" />
                <Skeleton className="w-full h-4 rounded-lg mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="w-16 h-6 rounded-lg" />
                  <Skeleton className="w-16 h-6 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailSkeleton;
