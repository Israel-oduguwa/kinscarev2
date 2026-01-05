import React, { Suspense } from "react";
import Navbar from "@/WebPages/Navbar";
import CaregiverDetails from "@/WebPages/FindCaregiver/CaregiverDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

// Skeleton Component
const CandidateDetailsSkeleton = () => {
  return (
    <div className="bg-gray-100 ">
      <div className="mx-auto max-w-6xl py-10 p-6 space-y-4">
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
    </div>
  );
};

const obfuscateName = (name: string): string => {
  const words = name.split(' ');
  return words
    .map((word) => {
      if (word.length <= 2) return word;
      if (word.length <= 6) {
        const first = word.slice(0, 1);
        const last = word.slice(-1);
        return `${first}${'*'.repeat(word.length - 2)}${last}`;
      } else {
        const first = word.slice(0, 3);
        const last = word.slice(-3);
        return `${first}${'*'.repeat(word.length - 6)}${last}`;
      }
    })
    .join(' ');
};

const obfuscateEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  const obfuscatedLocalPart = `${localPart.slice(0, 3)}${'*'.repeat(
    Math.max(localPart.length - 6, 0)
  )}${localPart.slice(-3)}`;
  return `${obfuscatedLocalPart}@${domain}`;
};

// Metadata function
export async function generateMetadata({
  params,
}: {
  params: { candidateID: string };
}): Promise<Metadata> {
  const { candidateID } = params;

  try {
    const response = await fetch(
      `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/caregivers/${candidateID}`,
      { cache: 'no-cache' }
    );
    const { caregiver } = await response.json();

    // Obfuscate sensitive details
    const obfuscatedName = `${obfuscateName(caregiver.fname)} ${obfuscateName(
      caregiver.lname
    )}`;
    const obfuscatedEmail = obfuscateEmail(caregiver.settings.email);

    // Truncate caregiver description while keeping HTML tags
    const truncatedCertifications = caregiver.certifications;

    // Generate JSON-LD for caregiver rich results
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: obfuscatedName,
      email: obfuscatedEmail,
      address: {
        '@type': 'PostalAddress',
        addressLocality: caregiver.city,
        addressRegion: 'WA', // Assuming Washington, adjust if needed
        postalCode: caregiver.zipcode,
        addressCountry: 'US',
      },
      image: caregiver.profileImage || 'https://default-profile-image.com',
      jobTitle: 'Caregiver',
      description: truncatedCertifications,
      knowsAbout: caregiver.licenses.slice(0, 3), // Top licenses
    };

    return {
      title: `${obfuscatedName} - Caregiver in ${caregiver.city}`,
      description: truncatedCertifications,
      openGraph: {
        title: `${obfuscatedName} - Caregiver Profile`,
        description: truncatedCertifications,
        url: `https://kinscare.org/caregivers/${candidateID}`,
        images: [
          {
            url: caregiver.profileImage || 'https://default-profile-image.com',
            alt: obfuscatedName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${obfuscatedName} - Caregiver Profile`,
        description: truncatedCertifications,
        images: [
          caregiver.profileImage || 'https://default-profile-image.com',
        ],
      },
      
    };
  } catch (error) {
    console.error('Failed to fetch caregiver details for metadata', error);
    return {
      title: 'Caregiver Details',
      description: 'Explore caregiver profiles with Kinscare.',
    };
  }
}

async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <div className="mt-10">
      <Navbar />
      <Suspense fallback={<CandidateDetailsSkeleton />}>
        <div className="bg-gray-100 ">
          <CaregiverDetails candidateID={id} />
        </div>
      </Suspense>
    </div>
  );
}

export default page;
