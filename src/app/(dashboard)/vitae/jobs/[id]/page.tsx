import React, { Suspense } from "react";
import CaregiverJob from "@/Caregivers/Jobs/CaregiverJob";
async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-4">
          <h1>Loading....</h1>
        </div>
      }
    >
      <CaregiverJob jobID={id} />
    </Suspense>
  );
}

export default page;
