// app/caregivers/Caregivers.tsx
import OAuthDialog from "@/Authentication/OAuthDialog";
import SigninModal from "@/Authentication/SiginModal";
import ProfileAvatar from "@/components/ProfileAvatar";
import ToastPortal, { type ToastMsg } from "@/components/ToastPortal";
import { Button } from "@/components/ui/button";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { MapPin, User } from "lucide-react";
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

interface CaregiversProps {
  availability: string; // comma-separated
  page: number;
  licenses: string; // comma-separated
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
const Chip: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
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
  const availabilityPulse = false; // wire to realtime if you have it
  const displayName = isAuthenticated ? candidate.name : obfuscateName(candidate.name);

  const sanitizedContent = sanitizeContent(candidate.certifications);
  const encryptedTel = obfuscateText(formatPhoneNumberToDigitsWithPlus(candidate?.auth?.tel));
  const encryptedEmail = obfuscateText(candidate?.auth?.email);

  const locationLine = [candidate.city ?? "", candidate.zipcode ?? ""]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full">
      <div
        className="group relative flex flex-col lg:flex-row items-start justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md focus-within:shadow-md"
        role="article"
      >
        <Link
          href={`caregivers/${encodeURIComponent(candidate.userID)}`}
          className="flex-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
          aria-label={`Open caregiver ${candidate.name}`}
        >
          <div className="mb-3 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <ProfileAvatar
                size="w-14 h-14"
                name={candidate.name}
                profileImage={candidate?.profileImage}
              />
              <div className="min-w-0">
                <p className="flex items-center text-base font-semibold text-gray-900">
                  <span className="truncate">{displayName}</span>
                  {availabilityPulse && (
                    <span className="ml-2 relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{locationLine || "—"}</span>
                  {availabilityPulse && (
                    <span className="ml-2 text-xs font-medium text-green-600">Available now</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Meta chips */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                Licences
              </h4>
              {(candidate.licenses ?? []).length ? (
                <div className="flex flex-wrap gap-2">
                  {(candidate.licenses ?? []).map((license, idx) => (
                    <Chip key={`${license}-${idx}`} title={license}>
                      {license}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not provided</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
                Availability
              </h4>
              {(candidate.availability ?? []).length ? (
                <div className="flex flex-wrap gap-2">
                  {(candidate.availability ?? []).map((sch, idx) => (
                    <Chip key={`${sch}-${idx}`} title={sch}>
                      {sch}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not provided</p>
              )}
            </div>
          </div>

          {/* Certifications (sanitized) */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
              Certifications
            </h4>
            <div className="text-sm text-gray-700 line-clamp-2">
              <Interweave content={sanitizedContent} />
            </div>
          </div>

          {/* Contact Details (obfuscated) */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
              Contact Details
            </h4>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p>Phone: {encryptedTel || "Hidden"}</p>
              <p>Email: {encryptedEmail || "Hidden"}</p>
            </div>
          </div>

          {/* Info banner */}
          <div className="mt-4">
            <p className="text-sm px-3 py-2 max-w-[460px] rounded-md bg-blue-50 text-blue-900 font-medium">
              Contact details are hidden. Click <span className="font-semibold">“View Caregiver”</span> to see full info and hire.
            </p>
          </div>
        </Link>

        {/* CTA */}
        <div className="mt-6 w-full lg:w-auto lg:mt-0 lg:ml-4 flex-shrink-0">
          <OAuthDialog caregiver={candidate} userID={candidate.userID} message="caregiver">
            <Button className="w-full lg:w-auto rounded-xl px-6 py-3 shadow-[0_8px_20px_-8px_rgba(59,130,246,0.6)] transition hover:shadow-[0_12px_28px_-10px_rgba(59,130,246,0.65)]">
              <span className="flex items-center gap-2">
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
export default async function Caregivers({ availability, page, licenses }: CaregiversProps) {
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

    const res = await fetch(
      `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/find-caregivers/filter?${params.toString()}`,
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
      caregivers = Array.isArray(json.caregivers) ? (json.caregivers as Caregiver[]) : [];
      if (json?.pagination) {
        pagination = {
          totalCaregivers: Number(json.pagination.totalCaregivers ?? caregivers.length) || 0,
          totalPages: Number(json.pagination.totalPages ?? 1) || 1,
          currentPage: Number(json.pagination.currentPage ?? page) || page,
          limit: Number(json.pagination.limit ?? 10) || 10,
        };
      }

      if (!caregivers.length) {
        toasts.push({
          type: "info",
          message: "No caregivers matched your filters. Try adjusting licenses or availability.",
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

  // Build “Load more” href (preserve filters)
  const nextPage =
    pagination.currentPage < pagination.totalPages
      ? pagination.currentPage + 1
      : null;
  const loadMoreHref = nextPage
    ? `?availability=${encodeURIComponent(availability)}&licenses=${encodeURIComponent(
        licenses
      )}&page=${nextPage}`
    : "#";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Server-to-client toasts */}
      <ToastPortal messages={toasts} />

      {/* Header with search + summary */}
      <div className="relative border-b border-gray-200/70 bg-[radial-gradient(60%_80%_at_50%_-20%,rgba(59,130,246,0.10),transparent)]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col py-6 gap-4">
            <SearchBar availability={availabilityArray} licenses={licensesArray} />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-base font-semibold tracking-tight text-gray-800">
                {`There ${pagination.totalCaregivers === 1 ? "is" : "are"} `}
                <span className="text-blue-600">{pagination.totalCaregivers}</span>{" "}
                {`caregiver${pagination.totalCaregivers === 1 ? "" : "s"} near you`}
                {licenses ? ` with ${licenses}` : ""}.
                {" "}
                {firstCandidate ? (
                  <OAuthDialog caregiver={firstCandidate} userID={firstCandidate.userID} message="caregiver">
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
                  <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
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
