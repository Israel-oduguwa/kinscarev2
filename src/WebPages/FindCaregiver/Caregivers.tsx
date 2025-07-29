// app/caregivers/Caregivers.tsx

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { MapPin, User } from "lucide-react";
import truncateHtml from "html-truncate";
import SearchBar from "./SearchBar";
import OAuthDialog from "@/Authentication/OAuthDialog";
import ProfileAvatar from "@/components/ProfileAvatar";
import StickyBanner from "./ConciergeSidebarCard";
import ConciergeSidebarCard from "./ConciergeSidebarCard";

polyfill();

interface Caregiver {
  userID: string;
  name: string;
  profileImage?: string;
  city: string;
  zipcode: string;
  certifications: string;
  licenses: string[];
  availability: string[];
  auth?: { tel?: string; email?: string };
}

interface Pagination {
  totalCaregivers: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface CaregiversProps {
  availability: string;
  page: number;
  licenses: string;
}

const sanitizeContent = (htmlContent: string) => {
  if (htmlContent) {
    // Remove <img> tags using regex
    return htmlContent.replace(/<img[^>]*>/gi, "");
  }
};
const obfuscateName = (name: string): string => {
  const words = name.split(" ");
  return words
    .map((word) => {
      if (word.length <= 2) return word; // Leave very short words unchanged
      if (word.length <= 6) {
        // For words with <= 6 characters, obfuscate the middle
        const firstPart = word.slice(0, 1); // First character
        const lastPart = word.slice(-1); // Last character
        const middlePart = "*".repeat(
          word.length - firstPart.length - lastPart.length
        );
        return `${firstPart}${middlePart}${lastPart}`;
      } else {
        // For words longer than 6 characters, use the first 3 and last 3 characters
        const firstPart = word.slice(0, 3);
        const lastPart = word.slice(-3);
        const middlePart = "*".repeat(
          word.length - firstPart.length - lastPart.length
        );
        return `${firstPart}${middlePart}${lastPart}`;
      }
    })
    .join(" ");
};
const obfuscateText = (text: any) => {
  if (text) {
    if (text.includes("@")) {
      const [localPart, domain] = text.split("@");
      if (localPart.length <= 2) return text;
      const obfuscatedLocalPart = `${localPart.slice(0, 3)}${"*".repeat(
        Math.max(localPart.length - 6, 0)
      )}${localPart.slice(-3)}`;
      return `${obfuscatedLocalPart}@${domain}`;
    }
    const words = text.split(" ");
    return words.map((word: string | any[]) => {
      if (word.length <= 2) return word;
      const firstPart = word.slice(0, 3);
      const lastPart = word.slice(-3);
      const middlePart = "*".repeat(
        word.length - firstPart.length - lastPart.length
      );
      return `${firstPart}${middlePart}${lastPart}`;
    });
  }
};
function formatPhoneNumberToDigitsWithPlus(phone: any) {
  if (phone) {
    return phone.replace(/(?!^\+)\D/g, "");
  }
}

const CandidatesCard = ({ candidate, isAuthenticated }: any) => {
  const availability = false;
  const displayName = isAuthenticated
    ? candidate.name
    : obfuscateName(candidate.name);

  const sanitizedContent = sanitizeContent(candidate.certifications);
  const encryptedTel = obfuscateText(
    formatPhoneNumberToDigitsWithPlus(candidate?.auth?.tel)
  );

  const encryptedEmail = obfuscateText(candidate?.auth?.email);
  return (
    <div className="w-full mb-6">
      <div className="bg-white flex flex-col lg:flex-row items-start lg:items-start justify-between shadow-md border border-gray-100 rounded-lg p-6">
        <Link href={`caregivers/${candidate.userID}`} className="flex-1">
          {/* Candidate Info */}
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
                  {availability && (
                    <span className="ml-2 relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin size={15} />
                  {candidate.city}, {candidate.zipcode}{" "}
                  {availability && (
                    <span className="text-sm text-green-600 font-medium">
                      Available now
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Licenses and Availability */}
          {/* <div className="flex flex-wrap gap-2 mt-4 mb-2 lg:mt-0">
          
          </div> */}
          <div className="py-1">
            <h4 className="text-sm font-bold mb-1 text-gray-700">Licences</h4>
            {candidate.licenses.map((license: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg"
              >
                {license}
              </span>
            ))}
          </div>
          <div className="py-1">
            <h4 className="text-sm font-bold mb-1 text-gray-700">
              Availablity
            </h4>
            {candidate.availability.map((sch: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg"
              >
                {sch}
              </span>
            ))}
          </div>
          {/* Certifications */}
          <div className="py-2">
            <h4 className="text-sm font-bold text-gray-700">Certifications</h4>
            <div className="text-sm text-gray-600 line-clamp-2">
              <Interweave content={sanitizedContent} />
            </div>
          </div>
          <div className="py-2">
            <h4 className="text-sm font-bold text-gray-700">Contact Details</h4>
            <div>
              <p className="text-sm">Phone: {encryptedTel}</p>
              <p className="text-sm">Email: {encryptedEmail}</p>
            </div>
          </div>
          <div className="pt-1">
            <p className="text-sm px-3 cursor-pointer max-w-[400px] font-semibold mt-1 py-2 rounded-md bg-blue-50 text-blue-900">
              Click {`"View Caregiver"`} to see contact details
            </p>
            {/* <p className="text-sm"></p> */}
          </div>
        </Link>

        {/* Message Button */}
        <div className="mt-6 w-full lg:w-auto lg:mt-0 lg:ml-4 flex-shrink-0">
          <OAuthDialog
            caregiver={candidate}
            userID={candidate.userID}
            message="caregiver"
          >
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
};

/**
 * Entire Caregivers server component in one file.
 * Handles fetching, errors, and rendering.
 */
async function Caregivers({ availability, page, licenses }: CaregiversProps) {
  // Prepare arrays for SearchBar
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
  let fetchError = false;

  try {
    const res = await fetch(
      `https://api.kinscare.org/api/v1/providers/find-caregivers/filter?availability=${encodeURIComponent(
        availability
      )}&licenses=${encodeURIComponent(licenses)}&page=${encodeURIComponent(
        String(page)
      )}&limit=10`,
      { cache: "no-cache" }
    );
    if (!res.ok) {
      fetchError = true;
      console.error("Fetch error:", res.status, res.statusText);
    } else {
      const json = await res.json();
      caregivers = Array.isArray(json.caregivers) ? json.caregivers : [];
      pagination = {
        totalCaregivers: json.pagination.totalCaregivers,
        totalPages: json.pagination.totalPages,
        currentPage: json.pagination.currentPage,
        limit: json.pagination.limit,
      };
    }
  } catch (err) {
    fetchError = true;
    console.error("Network or JSON parse error:", err);
  }

  return (
    <div className="w-full bg-gray-100 min-h-[100vh] p-3">
      <div className="max-w-7xl mx-auto py-10">
        {/* Full-width Search Bar */}
        <div className="mb-6">
          <SearchBar
            availability={availabilityArray}
            licenses={licensesArray}
          />
        </div>
        {/* Grid for results + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Caregivers List */}
          <div className="col-span-12 lg:col-span-9">
            <h1 className="text-md text-gray-800 tracking-tight antialiased font-bold mb-4">
              {fetchError
                ? "Unable to load caregivers."
                : `There are ${pagination.totalCaregivers} caregivers near you with ${licenses}`}
              .{" "}
              <span className="italic">
                Register or sign in to view caregiver contacts{" "}
                <OAuthDialog
                  caregiver={caregivers[0]}
                  userID={caregivers[0].userID}
                  message="caregiver"
                >
                  <Button className="shadow-md px-2 py-1 shadow-slate-300 font-bold mx-2" variant="link">Register</Button>
                </OAuthDialog>
              </span>
            </h1>
            {fetchError ? (
              <div className="py-10 text-center">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Something went wrong loading caregivers. Please try again
                  later.
                </p>
              </div>
            ) : caregivers.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-lg text-gray-700 dark:text-gray-300">
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
                      href={`?availability=${encodeURIComponent(
                        availability
                      )}&licenses=${encodeURIComponent(licenses)}&page=${
                        pagination.currentPage + 1
                      }`}
                      passHref
                    >
                      <Button asChild>Load More</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
            {/* On mobile, sidebar card appears after list */}
            <div className="block lg:hidden mt-4">
              <ConciergeSidebarCard />
            </div>
          </div>
          {/* Concierge Sidebar card: right side only on large screens */}
          <div className="hidden lg:block mt-10 col-span-3">
            <ConciergeSidebarCard />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Caregivers;
