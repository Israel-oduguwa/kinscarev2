import { Skeleton } from "@/components/ui/skeleton";
import { CaregiverCardSkeleton } from "@/Providers/Candidates/CandidateSkelenton";
import Caregivers from "@/WebPages/FindCaregiver/Caregivers";
import Navbar from "@/WebPages/Navbar";
import React, { Suspense } from "react";
async function page({
  searchParams,
}: {
  searchParams: { shifts?: string; licenses?: string };
}) {
  const { shifts, licenses }: any = await searchParams;
  return (
    <div className="mt-10">
      <Navbar />
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 py-10 mt-10 px-4 lg:px-0  gap-6">
              <Skeleton className="w-full h-40 " />
              {Array.from({ length: 6 }).map((_, idx) => (
                <CaregiverCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        }
      >
        <Caregivers availability={shifts} licenses={licenses} />
      </Suspense>
    </div>
  );
}

export default page;
