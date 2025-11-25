import ExcelCNAAuth from "@/Authentication/ExcelCNAAuth";
import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function AuthSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6">
      <Skeleton className="h-10 w-3/4 rounded-lg" /> {/* title placeholder */}
      <Skeleton className="h-6 w-1/2 rounded-lg" />  {/* subtitle placeholder */}
      <div className="flex flex-col gap-3 mt-4">
        <Skeleton className="h-12 w-full rounded-lg" /> {/* input */}
        <Skeleton className="h-12 w-full rounded-lg" /> {/* input */}
        <Skeleton className="h-12 w-32 rounded-lg" /> {/* button */}
      </div>
    </div>
  );
}

function Page() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <ExcelCNAAuth />
    </Suspense>
  );
}

export default Page;
