import FindCaregiverLandingPage from "@/WebPages/FindCaregiver/FindCaregiverLandingPage";
import Footer from "@/WebPages/Footer";
import Navbar from "@/WebPages/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Trusted Caregivers Near You - KinsCare",
  description:
    "Easily find experienced and compassionate caregivers for your loved ones. Explore KinsCare for personalized caregiver matching services.",
  openGraph: {
    title: "Find Trusted Caregivers Near You - KinsCare",
    description:
      "Easily find experienced and compassionate caregivers for your loved ones. Explore KinsCare for personalized caregiver matching services.",
    url: "https://yourwebsite.com/find-caregiver",
    images: [
      {
        url: "https://yourwebsite.com/images/find-caregiver-banner.jpg", // Replace with your actual banner image URL
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
      "https://yourwebsite.com/images/find-caregiver-banner.jpg", // Replace with your actual banner image URL
    ],
  },
  alternates: {
    canonical: "https://yourwebsite.com/find-caregiver",
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
      url: "https://yourwebsite.com/find-caregiver",
      mainEntity: {
        "@type": "Service",
        name: "Caregiver Matching Service",
        description:
          "Find professional caregivers for home care, live-in care, and specialized support.",
        provider: {
          "@type": "Organization",
          name: "KinsCare",
          url: "https://yourwebsite.com",
        },
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://yourwebsite.com/find-caregiver?q={search_term_string}",
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

      <Navbar />

      <FindCaregiverLandingPage />
      {/* Footer */}
      <footer className="bg-white text-white py-10">
        <Footer />
      </footer>
    </>
  );
}

export default page;
