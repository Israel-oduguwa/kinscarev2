import React, { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "@/WebPages/Navbar";
import Footer from "@/WebPages/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { CaregiverCardSkeleton } from "@/Providers/Candidates/CandidateSkelenton";
import Caregivers from "@/WebPages/FindCaregiver/Caregivers";
import { redirect } from "next/navigation";
import StoreLeadParams from "@/Utils/StoreLeadParams";
import JumpstartHiringModal from "@/WebPages/FindCaregiver/JumpstartHiringModal";

/**
 * Prevent Next.js from caching this route so data and metadata remain fresh.
 */
export const dynamic = "force-dynamic";

const DEFAULT_SHIFTS = "Full time";
const DEFAULT_LICENSES = "HCA";

/**
 * Generate dynamic metadata based on query parameters.
 * Runs on the server.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    shifts?: string;
    licenses?: string;
    page?: string;
    zipcode?: string;
    email?: string;
    phone?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams; // ✅ required in Next.js 16
  const shifts = params.shifts ?? DEFAULT_SHIFTS;
  const licenses = params.licenses ?? DEFAULT_LICENSES;
  const page = params.page ?? "1";

  try {
    const response = await fetch(
      `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/find-caregivers/filter?availability=${encodeURIComponent(
        shifts
      )}&licenses=${encodeURIComponent(licenses)}&page=${encodeURIComponent(
        page
      )}&limit=10`,
      { cache: "no-cache" }
    );

    const { caregivers } = await response.json();

    const truncatedDescription = (caregivers as any[])
      ?.map(
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
  searchParams: Promise<{
    shifts?: string;
    licenses?: string;
    page?: string;
    zipcode?: string;
    email?: string;
    phone?: string;
  }>;
}

/**
 * Main /caregivers page component.
 * Uses Suspense for a loading skeleton while <Caregivers> loads.
 * Any runtime errors within <Caregivers> will be caught by app/caregivers/error.tsx.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams; // ✅ unwrap Promise
  const {
    shifts,
    licenses,
    page,
    zipcode = "",
    email = "",
    phone = "",
  } = params;

  // If coming from Twilio with only zipcode/email/phone, add defaults and preserve all params.
  if (!shifts || !licenses) {
    const qp = new URLSearchParams();

    if (zipcode) qp.set("zipcode", zipcode);
    if (email) qp.set("email", email);
    if (phone) qp.set("phone", phone);
    if (page) qp.set("page", page);

    qp.set("shifts", shifts || DEFAULT_SHIFTS);
    qp.set("licenses", licenses || DEFAULT_LICENSES);

    redirect(`/caregivers?${qp.toString()}`);
  }

  return (
    <div className="mt-10">
      <StoreLeadParams zipcode={zipcode} email={email} phone={phone} />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto">
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
          availability={shifts || DEFAULT_SHIFTS}
          licenses={licenses || DEFAULT_LICENSES}
          zipcode={zipcode}
        />
        <JumpstartHiringModal source="twilio" email={email} phone={phone} />
      </Suspense>
    </div>
  );
}
