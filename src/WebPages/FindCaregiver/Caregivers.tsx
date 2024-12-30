import OAuthDialog from "@/Authentication/OAuthDialog";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { MapPin, Send } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
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
    <div className="w-full mb-4 relative">
      <Link href={`caregivers/${candidate.userID}`}>
        <div className="mb-1 flex bg-white flex-col space-y-4 shadow-md border border-gray-50 rounded-lg p-6">
          <div className="flex justify-between">
            <div className="flex space-x-2 items-center">
              <ProfileAvatar
                size="w-12 h-12"
                name={candidate.name}
                profileImage={candidate?.profileImage}
              />
              <div>
                <p className="antialiased flex space-x-2 font-bold relative text-gray-900">
                  {displayName}{" "}
                  {availability && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 flex flex-wrap gap-0.5 space-x-1 items-center">
                  <MapPin size={15} />
                  {candidate.city}, {candidate.zipcode}{" "}
                  <span className="h-1 w-1 bg-gray-700 rounded-full"></span>
                  {availability && (
                    <span className="text-sm text-green-600 antialiased">
                      Available now
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="w-full flex-wrap gap-4 flex">
              {candidate.licenses.map((license: any, index: any) => (
                <div
                  key={index}
                  className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                >
                  <span className="text-sm text-gray-600">{license}</span>
                </div>
              ))}
              {candidate.availability.map(
                (
                  sch:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined,
                  index: Key | null | undefined
                ) => (
                  <div
                    key={index}
                    className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                  >
                    <span className="text-sm text-gray-600">{sch}</span>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="w-full ">
            <h4 className="flex mb-2 text-sm font-bold items-center">
              Certifications
            </h4>
            <div className="text-sm text-gray-600 line-clamp-2">
              <Interweave content={sanitizedContent} />
            </div>
          </div>
        </div>
      </Link>
      <OAuthDialog userID={candidate.userID} message="caregiver">
        <Button className="absolute top-3 right-3">
          <span className="flex space-x-1 items-center gap-2">
            <Send size={16} /> Message caregiver
          </span>{" "}
        </Button>
      </OAuthDialog>
    </div>
  );
};

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const availability = params.availability || "all";
  const licenses = params.licenses || "all";
  const currentPage = params.page || 1;

  const title = `Caregivers Near You | ${availability} Availability | ${licenses} Licenses`;
  const description = `Discover the best caregivers near you with ${availability} availability and licensed for ${licenses}. Find top-rated caregivers easily.`;

  const baseUrl = "https://yourwebsite.com/caregivers";
  const prevPage =
    currentPage > 1
      ? `${baseUrl}?availability=${availability}&licenses=${licenses}&page=${
          currentPage - 1
        }`
      : null;
  const nextPage = `${baseUrl}?availability=${availability}&licenses=${licenses}&page=${
    currentPage + 1
  }`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}?availability=${availability}&licenses=${licenses}&page=${currentPage}`,
      type: "website",
      images: [
        {
          url: "https://yourwebsite.com/og-image.jpg", // Replace with your image
          width: 1200,
          height: 630,
          alt: "Caregivers Near You",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://yourwebsite.com/og-image.jpg"], // Replace with your image
    },
    alternates: {
      canonical: `${baseUrl}?availability=${availability}&licenses=${licenses}&page=${currentPage}`,
    },
    link: [
      prevPage && { rel: "prev", href: prevPage },
      { rel: "next", href: nextPage },
    ].filter(Boolean),
  };
}

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
  // JSON-LD for caregivers
  const caregiversStructuredData = caregivers.map((caregiver: any) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${caregiver.fname} ${caregiver.lname}`,
    jobTitle: "Caregiver",
    address: {
      "@type": "PostalAddress",
      addressLocality: caregiver.city,
      addressRegion: caregiver.state || "N/A",
      postalCode: caregiver.zipcode,
    },
    telephone: caregiver.telephone,
    email: caregiver.email,
    worksFor: {
      "@type": "Organization",
      name: caregiver.company || "Independent",
    },
    description: caregiver.description || "Experienced caregiver available.",
  }));

  
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
            <SearchBar availability={availabilityArray} licenses={licensesArray} />
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
