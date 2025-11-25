import { Skeleton } from "@/components/ui/skeleton";
import { CaregiverCardSkeleton } from "@/Providers/Candidates/CandidateSkelenton";
import FindCaregiverLandingPage from "@/WebPages/FindCaregiver/FindCaregiverLandingPage";
import Footer from "@/WebPages/Footer";
import Navbar from "@/WebPages/Navbar";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Find Trusted Caregivers Near You - KinsCare",
  description:
    "Easily find experienced and compassionate caregivers for your loved ones. Explore KinsCare for personalized caregiver matching services.",
  openGraph: {
    title: "Find Trusted Caregivers Near You - KinsCare",
    description:
      "Easily find experienced and compassionate caregivers for your loved ones. Explore KinsCare for personalized caregiver matching services.",
    url: "https://kinscare.org/find-caregiver",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1380983332-min.jpg?alt=media&token=5f9db9a8-fe08-40a3-bb3c-cda1feb17bed", // Replace with your actual banner image URL
        alt: "Find Trusted Caregivers Near You",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Trusted Caregivers Near You - KinsCare",
    description:
      "Easily find experienced and compassionate caregivers for your loved ones. Explore KinsCare for personalized caregiver matching services.",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1380983332-min.jpg?alt=media&token=5f9db9a8-fe08-40a3-bb3c-cda1feb17bed", // Replace with your actual banner image URL
    ],
  },
  alternates: {
    canonical: "https://kinscare.org/find-caregiver",
  },
};

function page() {
  const jsonLd = {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Find Trusted Caregivers",
      description:
        "Easily find experienced and compassionate caregivers for your loved ones. Explore KinsCare for personalized caregiver matching services.",
      url: "https://kinscare.org/find-caregiver",
      mainEntity: {
        "@type": "Service",
        name: "Caregiver Matching Service",
        description:
          "Find professional caregivers for home care, live-in care, and specialized support.",
        provider: {
          "@type": "Organization",
          name: "KinsCare",
          url: "https://kinscare.org",
        },
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://kinscare.org/find-caregiver?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    }),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 py-10 mt-10  gap-6">
              <Skeleton className="w-full h-40 " />
              {Array.from({ length: 6 }).map((_, idx) => (
                <CaregiverCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        }
      >
        <FindCaregiverLandingPage />
        {/* Footer */}
      </Suspense>
    </>
  );
}

export default page;
