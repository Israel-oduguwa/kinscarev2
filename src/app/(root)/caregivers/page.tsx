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

// --- SEO constants (safe to keep at top of your file) ---
const SITE_URL = "https://www.kinscare.org";
const OG_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444";
const BRAND = "KinsCare";

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

  // Inputs (with defaults)
  const shifts = (params.shifts ?? DEFAULT_SHIFTS).trim();
  const licenses = (params.licenses ?? DEFAULT_LICENSES).trim();
  const page = (params.page ?? "1").trim();
  const zipcode = (params.zipcode ?? "").trim();

  // Canonical URL (exclude PII like email, phone)
  const qp = new URLSearchParams();
  qp.set("shifts", shifts);
  qp.set("licenses", licenses);
  if (page) qp.set("page", page);
  if (zipcode) qp.set("zipcode", zipcode);
  const canonicalPath = `/caregivers?${qp.toString()}`;

  // Title logic (short, scannable, keyword-rich)
  const titleParts: string[] = [];
  titleParts.push("Find Caregivers");
  if (licenses) titleParts.push(licenses);
  if (zipcode) titleParts.push(`in ${zipcode}`);
  if (shifts && shifts.toLowerCase() !== DEFAULT_SHIFTS.toLowerCase()) {
    titleParts.push(`• ${shifts}`);
  }
  titleParts.push(BRAND);
  const title = titleParts.join(" | ");

  // Default description (graceful fallback)
  let description =
    "Browse available, verified caregivers tailored to your needs. Filter by license (HCA, CNA, NAR), availability, and location to find the right match.";

  // Attempt to enrich description from your API (best-effort; safe on failure)
  try {
    const response = await fetch(
      `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/find-caregivers/filter?availability=${encodeURIComponent(
        shifts
      )}&licenses=${encodeURIComponent(licenses)}&page=${encodeURIComponent(
        page
      )}&limit=10`,
      { cache: "no-cache" }
    );

    if (response.ok) {
      const data = await response.json();
      const caregivers: any[] = data?.caregivers ?? [];
      const sample = caregivers
        .slice(0, 3)
        .map((c) => {
          const name = [c?.fname, c?.lname].filter(Boolean).join(" ");
          const certs = Array.isArray(c?.certifications)
            ? c.certifications.join("/")
            : c?.certifications || licenses;
          return name ? `${name} (${certs})` : null;
        })
        .filter(Boolean)
        .join(", ");

      if (sample) {
        description = `Top matches near you: ${sample}. Filter by ${licenses}${
          shifts ? ` and availability (${shifts})` : ""
        } to find a caregiver who fits your schedule.`;
      } else {
        description = `Explore caregivers${
          zipcode ? ` in ${zipcode}` : ""
        } with ${licenses} licenses${
          shifts ? ` and ${shifts} availability` : ""
        }. Compare profiles and connect with the right match.`;
      }
    }
  } catch {
    // keep default description on failure
  }

  // Dynamic keywords (avoid stuffing)
  const keywords = [
    "caregivers",
    "home care",
    "senior care",
    "in-home support",
    "care aide",
    "licensed caregiver",
    "HCA",
    "CNA",
    "NAR",
    shifts,
    licenses,
    zipcode ? `caregivers ${zipcode}` : "",
    BRAND,
  ]
    .filter(Boolean)
    .map((k) => k.toString());

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,

    alternates: {
      canonical: canonicalPath,
      languages: {
        "en-US": canonicalPath,
        en: canonicalPath,
      },
    },

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    keywords,
    category: "Care Services",
    referrer: "origin-when-cross-origin",
    applicationName: BRAND,
    authors: [{ name: BRAND }],

    openGraph: {
      type: "website",
      url: canonicalPath,
      siteName: BRAND,
      title,
      description,
      images: [{ url: OG_IMAGE }],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
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
    if (page) qp.set("page", page ?? "1");

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
