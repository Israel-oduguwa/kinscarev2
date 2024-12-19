import ProviderDetails from "@/Caregivers/ProviderDetails";
import { Suspense } from "react";
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
      <ProviderDetails providerId={id} />
    </Suspense>
  );
}

export default page;
