import React, { Suspense } from "react";
import ProviderJob, { ProviderJobSkeleton } from "@/Providers/Jobs/ProviderJob";
async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <Suspense
      fallback={
        <ProviderJobSkeleton />
      }
    >
      <ProviderJob jobID={id} viewer="caregiver" />
    </Suspense>
  );
}
export default page;
