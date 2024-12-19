import { Skeleton } from "@/components/ui/skeleton";
import { CaregiverCardSkeleton } from "@/Providers/Candidates/CandidateSkelenton";
import JobOpenings from "@/WebPages/Jobs/JobOpenings";
import Navbar from "@/WebPages/Navbar";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Job openings | KinsCare",
  description: "...",
};
async function FindJobs({
  searchParams,
}: {
  searchParams: { schedule?: string; licenses?: string };
}) {
  const { schedule, licenses }: any = await searchParams;
  return (
    <div>
      <Navbar />
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 py-10 mt-10  gap-6">
              <Skeleton className="w-full h-40 " />
              {Array.from({ length: 6 }).map((_, idx) => (
                <CaregiverCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        }
      >
        <JobOpenings schedule={schedule} licenses={licenses} />
      </Suspense>
    </div>
  );
}

export default FindJobs;
