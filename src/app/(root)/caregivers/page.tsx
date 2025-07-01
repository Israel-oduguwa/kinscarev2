// app/caregivers/page.tsx

import React, { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "@/WebPages/Navbar";
import Footer from "@/WebPages/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { CaregiverCardSkeleton } from "@/Providers/Candidates/CandidateSkelenton";
import Caregivers from "@/WebPages/FindCaregiver/Caregivers";

/**
 * Prevent Next.js from caching this route so data and metadata remain fresh.
 */
export const dynamic = "force-dynamic";

/**
 * Generate dynamic metadata based on query parameters.
 * Runs on the server.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { shifts?: string; licenses?: string; page?: string };
}): Promise<Metadata> {
  const { shifts, licenses, page } = searchParams;

  try {
    const response = await fetch(
      `https://api.kinscare.org/api/v1/providers/find-caregivers/filter?availability=${encodeURIComponent(
        shifts || ""
      )}&licenses=${encodeURIComponent(licenses || "")}&page=${encodeURIComponent(
        page || "1"
      )}&limit=10`,
      { cache: "no-cache" }
    );
    const { caregivers } = await response.json();

    const truncatedDescription = (caregivers as any[])
      .map(
        (caregiver: any) =>
          `${caregiver.fname} ${caregiver.lname} - ${caregiver.certifications}`
      )
      .slice(0, 3)
      .join(", ");

    return {
      title: `Find Caregivers${licenses ? ` - ${licenses}` : ""}`,
      description:
        truncatedDescription || "Browse available caregivers near you.",
      openGraph: {
        title: `Find Caregivers${licenses ? ` - ${licenses}` : ""}`,
        description:
          truncatedDescription || "Browse available caregivers near you.",
      },
      twitter: {
        title: `Caregivers${licenses ? ` - ${licenses}` : ""}`,
        description:
          truncatedDescription || "Browse available caregivers near you.",
      },
    };
  } catch (error) {
    console.error("Failed to fetch caregivers for metadata", error);
    return {
      title: "Caregivers — Search",
      description: "Find caregivers available near you.",
    };
  }
}

interface PageProps {
  searchParams: {
    shifts?: string;
    licenses?: string;
    page?: string;
  };
}

/**
 * Main /caregivers page component.
 * Uses Suspense for a loading skeleton while <Caregivers> loads.
 * Any runtime errors within <Caregivers> will be caught by app/caregivers/error.tsx.
 */
export default function Page({ searchParams }: PageProps) {
  const { shifts, licenses, page } = searchParams;

  return (
    <div className="mt-10">
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 py-10 mt-10 px-4 lg:px-0 gap-6">
              <Skeleton className="w-full h-40" />
              {Array.from({ length: 6 }).map((_, idx) => (
                <CaregiverCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        }
      >
        <Caregivers
          page={Number(page || 1)}
          availability={shifts || ""}
          licenses={licenses || ""}
        />
      </Suspense>
    </div>
  );
}
