import { Skeleton } from "@/components/ui/skeleton";
import { CaregiverCardSkeleton } from "@/Providers/Candidates/CandidateSkelenton";
import Caregivers from "@/WebPages/FindCaregiver/Caregivers";
import Navbar from "@/WebPages/Navbar";
import { Metadata } from "next";
import React, { Suspense } from "react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { availability: string; licenses: string };
}): Promise<Metadata> {
  const { shifts, licenses }: any = await searchParams;

  try {
    const response = await fetch(
      `https://api.kinscare.org/api/v1/providers/find-caregivers/filter?availability=${shifts}&licenses=${licenses}&page=1&limit=10`,
      { cache: "no-cache" }
    );
    const { caregivers } = await response.json();

    // Truncate caregiver descriptions while preserving HTML
    const truncatedDescription = caregivers
      .map(
        (caregiver: any) =>
          `${caregiver.fname} ${caregiver.lname} - ${caregiver.certifications}`
      )
      .slice(0, 3)
      .join(", ");

    return {
      title: `Find Caregivers - ${licenses} Available`,
      description: truncatedDescription,
      openGraph: {
        title: `Find Caregivers - ${licenses}`,
        description: truncatedDescription,
      },
      twitter: {
        title: `Caregivers with ${licenses}`,
        description: truncatedDescription,
      },
    };
  } catch (error) {
    console.error("Failed to fetch caregivers for metadata", error);
    return {
      title: "Caregivers - Search",
      description: "Find caregivers available near you.",
    };
  }
}
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
