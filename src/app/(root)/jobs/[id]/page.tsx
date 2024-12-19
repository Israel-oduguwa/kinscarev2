import React, { Suspense } from "react";
import Navbar from "@/WebPages/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import JobDetails from "@/WebPages/Jobs/JobDetails";
import JobDetailSkeleton from "@/WebPages/Jobs/JobDetailSkelenton";



async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <div className="mt-10">
      <Navbar />
      <Suspense fallback={<JobDetailSkeleton/>}>
        <div className="bg-white ">
          <JobDetails jobID={id} />
        </div>
      </Suspense>
    </div>
  );
}

export default page;
