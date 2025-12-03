// app/caregivers/Caregivers.tsx
import OAuthDialog from "@/Authentication/OAuthDialog";
import SigninModal from "@/Authentication/SiginModal";
import ProfileAvatar from "@/components/ProfileAvatar";
import ToastPortal, { type ToastMsg } from "@/components/ToastPortal";
import { Button } from "@/components/ui/button";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import {
  Award,
  BadgeCheck,
  Calendar,
  Info,
  MapPin,
  Phone,
  User
} from "lucide-react";
import Link from "next/link";
import ConciergeSidebarCard from "./ConciergeSidebarCard";
import SearchBar from "./SearchBar";

polyfill();

/* =========================
   Types
   ========================= */
interface Caregiver {
  userID: string;
  name: string;
  profileImage?: string;
  city?: string;
  zipcode?: string;
  certifications?: string;
  licenses?: string[];
  availability?: string[];
  auth?: { tel?: string; email?: string };
}

interface Pagination {
  totalCaregivers: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// Add to CaregiversProps
interface CaregiversProps {
  availability: string;
  page: number;
  licenses: string;
  zipcode?: string; // <-- add
}

/* =========================
   Utilities
   ========================= */
const sanitizeContent = (htmlContent?: string) =>
  (htmlContent || "").replace(/<img[^>]*>/gi, "");

const obfuscateName = (name: string): string => {
  const words = (name || "").split(" ");
  return words
    .map((word) => {
      if (word.length <= 2) return word;
      if (word.length <= 6) {
        const first = word.slice(0, 1);
        const last = word.slice(-1);
        return `${first}${"*".repeat(word.length - 2)}${last}`;
      }
      const first = word.slice(0, 3);
      const last = word.slice(-3);
      return `${first}${"*".repeat(word.length - 6)}${last}`;
    })
    .join(" ")
    .trim();
};

const obfuscateText = (text?: string) => {
  if (!text) return "";
  if (text.includes("@")) {
    const [localPart, domain] = text.split("@");
    if (!domain) return text;
    if (localPart.length <= 2) return text;
    const head = localPart.slice(0, 3);
    const tail = localPart.slice(-3);
    const stars = "*".repeat(Math.max(localPart.length - 6, 0));
    return `${head}${stars}${tail}@${domain}`;
  }
  const words = text.split(" ");
  return words
    .map((w) => {
      if (w.length <= 2) return w;
      const head = w.slice(0, 3);
      const tail = w.slice(-3);
      const stars = "*".repeat(Math.max(w.length - 6, 0));
      return `${head}${stars}${tail}`;
    })
    .join(" ");
};

function formatPhoneNumberToDigitsWithPlus(phone?: string) {
  if (!phone) return "";
  // Keep leading +, strip the rest
  return phone.replace(/(?!^\+)\D/g, "");
}

/* =========================
   Small UI helpers
   ========================= */
const Chip: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => (
  <span
    title={title}
    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
  >
    {children}
  </span>
);

/* =========================
   Candidate Card
   ========================= */
function CandidatesCard({
  candidate,
  isAuthenticated,
}: {
  candidate: Caregiver;
  isAuthenticated: boolean;
}) {
  const availabilityPulse = false;
  const displayName = isAuthenticated
    ? candidate.name
    : obfuscateName(candidate.name);
  const sanitizedContent = sanitizeContent(candidate.certifications);
  const encryptedTel = obfuscateText(
    formatPhoneNumberToDigitsWithPlus(candidate?.auth?.tel)
  );
  const encryptedEmail = obfuscateText(candidate?.auth?.email);
  const locationLine = [candidate.city ?? "", candidate.zipcode ?? ""]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full">
      {/* single-column card; button floats on desktop */}
      <div className="group isolate relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 lg:p-6 shadow-sm transition-all duration-300 hover:shadow-lg focus-within:shadow-lg">
        {/* decorative top bar */}
        {/* <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500" /> */}

        {/* CLICKABLE CONTENT spans full width */}
        <Link
          href={`caregivers/${encodeURIComponent(candidate.userID)}`}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
          aria-label={`Open caregiver ${candidate.name}`}
        >
          {/* === your existing inner content starts === */}
          <div className="mb-3 flex flex-col lg:flex-row lg:items-center gap-3.5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <ProfileAvatar
                  size="w-20 h-20"
                  name={candidate.name}
                  profileImage={candidate?.profileImage}
                  // className="ring-2 ring-white shadow-md"
                />
                {availabilityPulse && (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {displayName}
                  </p>
                  {availabilityPulse && (
                    <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available now
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="truncate">
                    {locationLine || "Location not specified"}
                  </span>
                </p>

                {availabilityPulse && (
                  <span className="md:hidden mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available now
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
            {/* Licenses */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4" />
                Licenses
              </h4>
              {(candidate.licenses ?? []).length ? (
                <div className="flex flex-wrap gap-1.5">
                  {(candidate.licenses ?? [])
                    .slice(0, 3)
                    .map((license, idx) => (
                      <Chip key={`${license}-${idx}`} title={license}>
                        {license}
                      </Chip>
                    ))}
                  {(candidate.licenses ?? []).length > 3 && (
                    <Chip
                      title={`+${(candidate.licenses ?? []).length - 3} more`}
                    >
                      +{(candidate.licenses ?? []).length - 3}
                    </Chip>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Not provided</p>
              )}
            </div>

            {/* Availability */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Availability
              </h4>
              {(candidate.availability ?? []).length ? (
                <div className="flex flex-wrap gap-1.5">
                  {(candidate.availability ?? [])
                    .slice(0, 2)
                    .map((sch, idx) => (
                      <Chip key={`${sch}-${idx}`} title={sch}>
                        {sch}
                      </Chip>
                    ))}
                  {(candidate.availability ?? []).length > 2 && (
                    <Chip
                      title={`+${
                        (candidate.availability ?? []).length - 2
                      } more`}
                    >
                      +{(candidate.availability ?? []).length - 2}
                    </Chip>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Not provided</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              Certifications
            </h4>
            <div className="text-sm text-gray-700 line-clamp-3 bg-gray-50 rounded-lg p-3 break-words overflow-hidden">
              {sanitizedContent ? (
                <Interweave content={sanitizedContent} />
              ) : (
                <p className="text-gray-400">No certifications provided</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              Contact Details
            </h4>
            <div className="text-sm text-gray-700 space-y-1.5 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span>{encryptedTel || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{encryptedEmail || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-800 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Contact details are hidden. Tap{" "}
                <span className="font-semibold">“View Caregiver”</span> to see
                full info and hire.
              </span>
            </p>
          </div>
          {/* === your existing inner content ends === */}
        </Link>

        {/* CTA: static on mobile; floats top-right on lg+; NOT inside the Link */}
        <div className="mt-6 lg:mt-0 lg:absolute lg:right-6 lg:top-6 lg:z-10">
          <OAuthDialog
            caregiver={candidate}
            userID={candidate.userID}
            message="caregiver"
          >
            <Button className="w-full lg:w-auto rounded-xl px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
              <span className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4" /> View Caregiver
              </span>
            </Button>
          </OAuthDialog>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Page
   ========================= */
export default async function Caregivers({
  availability,
  page,
  licenses,
  zipcode,
}: CaregiversProps) {
  const availabilityArray = availability
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const licensesArray = licenses
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let caregivers: Caregiver[] = [];
  let pagination: Pagination = {
    totalCaregivers: 0,
    totalPages: 1,
    currentPage: page,
    limit: 10,
  };
  const toasts: ToastMsg[] = [];

  try {
    const params = new URLSearchParams({
      availability,
      licenses,
      page: String(page),
      limit: "10",
    });
    if (zipcode) params.set("zipcode", zipcode); // <-- add

    const res = await fetch(
      `"https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/find-caregivers/filter?${params.toString()}`,
      { cache: "no-cache" }
    );

    if (!res.ok) {
      toasts.push({
        type: "error",
        title: `HTTP ${res.status} ${res.statusText}`,
        message: "We couldn’t load caregivers. Please try again shortly.",
      });
    } else {
      const json = await res.json().catch(() => ({}));
      caregivers = Array.isArray(json.caregivers)
        ? (json.caregivers as Caregiver[])
        : [];
      if (json?.pagination) {
        pagination = {
          totalCaregivers:
            Number(json.pagination.totalCaregivers ?? caregivers.length) || 0,
          totalPages: Number(json.pagination.totalPages ?? 1) || 1,
          currentPage: Number(json.pagination.currentPage ?? page) || page,
          limit: Number(json.pagination.limit ?? 10) || 10,
        };
      }

      if (!caregivers.length) {
        toasts.push({
          type: "info",
          message:
            "No caregivers matched your filters. Try adjusting licenses or availability.",
        });
      }
    }
  } catch (err: any) {
    toasts.push({
      type: "error",
      title: "Network error",
      message: err?.message || "Something went wrong while loading caregivers.",
    });
  }

  const firstCandidate = caregivers[0];

  const nextPage =
    pagination.currentPage < pagination.totalPages
      ? pagination.currentPage + 1
      : null;
  const loadMoreHref = nextPage
    ? `?availability=${encodeURIComponent(
        availability
      )}&licenses=${encodeURIComponent(licenses)}&page=${nextPage}`
    : "#";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Server-to-client toasts */}
      <ToastPortal messages={toasts} />

      {/* Header with search + summary */}
      <div className="relative border-b border-gray-200/70 bg-[radial-gradient(60%_80%_at_50%_-20%,rgba(59,130,246,0.10),transparent)]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col py-2 xl:py-6 gap-4">
            <SearchBar
              availability={availabilityArray}
              zipcode={zipcode}
              licenses={licensesArray}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-base font-semibold tracking-tight text-gray-800">
                {`There ${pagination.totalCaregivers === 1 ? "is" : "are"} `}
                <span className="text-blue-600">
                  {pagination.totalCaregivers}
                </span>{" "}
                {`caregiver${
                  pagination.totalCaregivers === 1 ? "" : "s"
                } near you`}
                {licenses ? ` with ${licenses}` : ""}.{" "}
                {firstCandidate ? (
                  <OAuthDialog
                    caregiver={firstCandidate}
                    userID={firstCandidate.userID}
                    message="caregiver"
                  >
                    <span className="cursor-pointer font-semibold text-blue-600 underline-offset-4 hover:underline">
                      Register
                    </span>
                  </OAuthDialog>
                ) : (
                  <SigninModal role="provider">
                    <span className="cursor-pointer font-semibold text-blue-600 underline-offset-4 hover:underline">
                      Register
                    </span>
                  </SigninModal>
                )}{" "}
                or{" "}
                <SigninModal role="provider">
                  <span className="cursor-pointer text-blue-600 underline-offset-4 hover:underline">
                    sign in
                  </span>
                </SigninModal>{" "}
                to view contact details and hire quickly.
              </h1>

              {/* Active filters */}
              <div className="flex flex-wrap items-center gap-2">
                {availabilityArray.map((a, i) => (
                  <Chip key={`avail-${a}-${i}`}>Availability: {a}</Chip>
                ))}
                {licensesArray.map((l, i) => (
                  <Chip key={`lic-${l}-${i}`}>License: {l}</Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
          {/* Results */}
          <div className="col-span-12 lg:col-span-9">
            {caregivers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <div className="mx-auto mb-4 h-16 w-16 text-gray-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-full w-full"
                  >
                    <path
                      d="M7 4h10a2 2 0 0 1 2 2v11l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 8h6M9 12h4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">
                  No caregivers found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {caregivers.map((candidate) => (
                  <CandidatesCard
                    key={candidate.userID}
                    candidate={candidate}
                    isAuthenticated={false}
                  />
                ))}

                {nextPage && (
                  <div className="flex justify-center">
                    <Link href={loadMoreHref} passHref>
                      <Button className="rounded-xl px-8">Load More</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile concierge card */}
            <div className="mt-6 block lg:hidden">
              <ConciergeSidebarCard />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="col-span-3 hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <ConciergeSidebarCard />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
