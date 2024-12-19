import React, { Suspense } from "react";
import CandidateDetails from "@/Providers/Candidates/CandidateDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

// Skeleton Component
const CandidateDetailsSkeleton = () => {
  return (
    <div className="bg-gray-100 p-6 space-y-4">
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
  );
};

// Generate Metadata
// Metadata Generator
export async function generateMetadata({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await rawParams; // Await the params object
  const data = await fetch(
    `http://localhost:8081/api/v1/providers/caregivers/${params.id}`,
    { cache: "no-cache" }
  );
  const response: any = await data.json();
  const { caregiver } = response;

  return {
    title: `${caregiver.fname} ${caregiver.lname} | Kinscare`,
    description: `View the profile of ${caregiver.fname} ${caregiver.lname}, a professional caregiver in ${caregiver.city}.`,
    robots: "noindex, nofollow",
    openGraph: {
      title: `Caregiver: ${caregiver.fname} ${caregiver.lname}`,
      description: `Discover ${caregiver.fname} ${
        caregiver.lname
      }, a caregiver with expertise in ${caregiver.licenses.join(
        ", "
      )}. Available in ${caregiver.city}.`,
      images: [
        {
          url: caregiver.profileImage,
          width: 800,
          height: 600,
          alt: `${caregiver.fname} ${caregiver.lname}`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `Caregiver: ${caregiver.fname} ${caregiver.lname}`,
      description: `Learn more about ${caregiver.fname}, a professional caregiver in ${caregiver.city}.`,
      images: [caregiver.profileImage],
    },
  };
}

// Page Component
async function page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <Suspense fallback={<CandidateDetailsSkeleton />}>
      <div className="bg-gray-100">
        <CandidateDetails candidateID={id} />
      </div>
    </Suspense>
  );
}

export default page;
