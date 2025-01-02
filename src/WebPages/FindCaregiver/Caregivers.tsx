import OAuthDialog from "@/Authentication/OAuthDialog";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { MapPin, Send } from "lucide-react";
import Link from "next/link";
import truncateHtml from "html-truncate"; // Ensure this is installed: `npm install html-truncate`
import { Metadata } from "next";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import SearchBar from "./SearchBar";
polyfill();

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

const CandidatesCard = ({ candidate, isAuthenticated }: any) => {
  const availability = false;
  const displayName = isAuthenticated
    ? candidate.name
    : obfuscateName(candidate.name);

  const sanitizedContent = sanitizeContent(candidate.certifications);
  return (
    <div className="w-full mb-6">
      <div className="bg-white flex flex-col lg:flex-row items-start lg:items-center justify-between shadow-md border border-gray-100 rounded-lg p-6">
        <Link href={`caregivers/${candidate.userID}`} className="flex-1">
          {/* Candidate Info */}
          <div className="flex mb-3 flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex items-center space-x-4">
              <ProfileAvatar
                size="w-16 h-16"
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
           <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
              {candidate.licenses.map((license: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg"
                >
                  {license}
                </span>
              ))}
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
          <div className="mt-4">
            <h4 className="text-sm font-bold text-gray-800">Certifications</h4>
            <div className="text-sm text-gray-600 line-clamp-2">
              <Interweave content={sanitizedContent} />
            </div>
          </div>
        </Link>

        {/* Message Button */}
        <div className="mt-6 w-full lg:w-auto lg:mt-0 lg:ml-4 flex-shrink-0">
          <OAuthDialog userID={candidate.userID} message="caregiver">
            <Button className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md w-full lg:w-auto">
              <span className="flex items-center gap-2">
                <Send size={16} /> Message Caregiver
              </span>
            </Button>
          </OAuthDialog>
        </div>
      </div>
    </div>
  );
};



async function Caregivers({
  availability,
  licenses,
}: {
  availability: string;
  licenses: string;
}) {
  console.log(availability, licenses);

  let data = await fetch(
    `https://api.kinscare.org/api/v1/providers/find-caregivers/filter?availability=${availability}&licenses=${licenses}&page=1&limit=10`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  const {
    caregivers,
    pagination: { totalCaregivers, totalPages, currentPage, limit },
  } = response;
  // console.log(caregivers)

  // convert the queries into an array
  const availabilityArray = Array.isArray(availability)
    ? availability
    : availability.split(",");
  const licensesArray = Array.isArray(licenses)
    ? licenses
    : licenses.split(",");
  return (
    <div className="w-full">
      <div className="bg-gray-100 min-h-[100vh] p-3">
        <div className="max-w-6xl py-10 mx-auto">
          <div className="mb-6">
            <SearchBar
              availability={availabilityArray}
              licenses={licensesArray}
            />
          </div>
          <h1 className="text-md text-gray-800 tracking-tight antialiased font-bold mb-4">
            There are {totalCaregivers} caregivers near you with {licenses}
          </h1>
          <div>
            {caregivers.map((caregiver: any, idx: any) => (
              <div key={idx}>
                {" "}
                <CandidatesCard candidate={caregiver} />
              </div>
            ))}
            {currentPage < totalPages && (
              <Button className="mt-4">Load More</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Caregivers;
