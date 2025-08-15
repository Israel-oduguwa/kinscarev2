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

  return (
    <div className="w-full mb-6">
      <div className="bg-white flex flex-col lg:flex-row items-start lg:items-start justify-between shadow-md border border-gray-100 rounded-lg p-6">
        <Link href={`caregivers/${encodeURIComponent(candidate.userID)}`} className="flex-1">
          <div className="flex mb-3 flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex items-center space-x-2">
              <ProfileAvatar
                size="w-14 h-14"
                name={candidate.name}
                profileImage={candidate?.profileImage}
              />
              <div>
                <p className="flex items-center text-lg font-bold text-gray-900">
                  {displayName}{" "}
                  {availabilityPulse && (
                    <span className="ml-2 relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin size={15} />
                  {(candidate.city ?? "—")}, {(candidate.zipcode ?? "—")}{" "}
                  {availabilityPulse && (
                    <span className="text-sm text-green-600 font-medium">Available now</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <h4 className="text-sm font-bold mb-1 text-gray-700">Licences</h4>
            {(candidate.licenses ?? []).length ? (
              (candidate.licenses ?? []).map((license, idx) => (
                <span key={`${license}-${idx}`} className="px-3 py-1 mr-2 text-sm bg-gray-100 text-gray-800 rounded-lg">
                  {license}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Not provided</span>
            )}
          </div>

          <div className="py-1">
            <h4 className="text-sm font-bold mb-1 text-gray-700">Availability</h4>
            {(candidate.availability ?? []).length ? (
              (candidate.availability ?? []).map((sch, idx) => (
                <span key={`${sch}-${idx}`} className="px-3 py-1 mr-2 text-sm bg-gray-100 text-gray-800 rounded-lg">
                  {sch}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Not provided</span>
            )}
          </div>

          <div className="py-2">
            <h4 className="text-sm font-bold text-gray-700">Certifications</h4>
            <div className="text-sm text-gray-600 line-clamp-2">
              <Interweave content={sanitizedContent} />
            </div>
          </div>

          <div className="py-2">
            <h4 className="text-sm font-bold text-gray-700">Contact Details</h4>
            <div>
              <p className="text-sm">Phone: {encryptedTel || "Hidden"}</p>
              <p className="text-sm">Email: {encryptedEmail || "Hidden"}</p>
            </div>
          </div>

          <div className="pt-1">
            <p className="text-sm px-3 cursor-pointer max-w-[400px] font-semibold mt-1 py-2 rounded-md bg-blue-50 text-blue-900">
              Click {`"View Caregiver"`} to see contact details
            </p>
          </div>
        </Link>

        <div className="mt-6 w-full lg:w-auto lg:mt-0 lg:ml-4 flex-shrink-0">
          <OAuthDialog caregiver={candidate} userID={candidate.userID} message="caregiver">
            <Button className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md w-full lg:w-auto">
              <span className="flex items-center gap-2">
                <User /> View Caregiver
              </span>
            </Button>
          </OAuthDialog>
        </div>
      </div>
    </div>
  );
}

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
      `https://kinscare-backend.onrender.com/api/v1/providers/find-caregivers/filter?${params.toString()}`,
      { cache: "no-cache" },
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

  return (
    <div className="w-full bg-gray-100 min-h-[100vh] p-3">
      {/* Client toast bridge */}
      <ToastPortal messages={toasts} />

      <div className="max-w-7xl mx-auto py-10">
        <div className="mb-6">
          {/* Search is client – fine to render here */}
          <SearchBar
            availability={availabilityArray}
            licenses={licensesArray}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="col-span-12 lg:col-span-9">
            <h1 className="text-md text-gray-8 00 tracking-normal antialiased font-bold mb-4">
              {`There ${pagination.totalCaregivers === 1 ? "is" : "are"} ${pagination.totalCaregivers} caregiver${pagination.totalCaregivers === 1 ? "" : "s"} near you`}
              {licenses ? ` with ${licenses}` : ""}.
              {" "}
              {firstCandidate ? (
                <OAuthDialog caregiver={firstCandidate} userID={firstCandidate.userID} message="caregiver">
                  <span className="text-blue-600 cursor-pointer">Register</span>
                </OAuthDialog>
              ) : (
                <SigninModal role="provider">
                  <span className="text-blue-600 cursor-pointer">Register</span>
                </SigninModal>
              )}{" "}
              or{" "}
              <SigninModal role="provider">
                <span className="text-blue-600 cursor-pointer">sign in</span>
              </SigninModal>{" "}
              to view contact details and hire quickly.
            </h1>

            {caregivers.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-lg text-gray-700">
                  No caregivers found matching your criteria.
                </p>
              </div>
            ) : (
              <div>
                {caregivers.map((candidate) => (
                  <CandidatesCard
                    key={candidate.userID}
                    candidate={candidate}
                    isAuthenticated={false}
                  />
                ))}

                {pagination.currentPage < pagination.totalPages && (
                  <div className="flex justify-center mt-6">
                    <Link
                      href={`?availability=${encodeURIComponent(availability)}&licenses=${encodeURIComponent(
                        licenses,
                      )}&page=${pagination.currentPage + 1}`}
                      passHref
                    >
                      <Button asChild>Load More</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="block lg:hidden mt-4">
              <ConciergeSidebarCard />
            </div>
          </div>

          <div className="hidden lg:block mt-10 col-span-3">
            <ConciergeSidebarCard />
          </div>
        </div>
      </div>
    </div>
  );
}
