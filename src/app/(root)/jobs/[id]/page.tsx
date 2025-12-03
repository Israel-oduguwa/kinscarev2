import React, { Suspense } from "react";
import Navbar from "@/WebPages/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import JobDetails from "@/WebPages/Jobs/JobDetails";
import JobDetailSkeleton from "@/WebPages/Jobs/JobDetailSkelenton";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = (await params).id;

  try {
    const response = await fetch(
      `"https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/caregivers/job/${id}`,
      { cache: "no-cache" }
    );
    const { job } = await response.json();

    // console.log("The Generate metadata work", job);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: job.description, // HTML content preserved
      identifier: {
        "@type": "PropertyValue",
        name: "Kinscare",
        value: job._id,
      },
      hiringOrganization: {
        "@type": "Organization",
        name: job.provider,
        logo:
          job.profileImage ||
          "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.contacts.city,
          addressRegion: job.contacts.city, // Assuming Washington, adjust accordingly
          addressCountry: "US",
          postalCode: job.contacts.zipcode,
        },
      },
      datePosted: job.createdAt,
      validThrough: "nill", // Replace with actual job expiration date
      employmentType: job.alert_preferences.join(", "),
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD", // Adjust currency as needed
        value: job.compensation,
      },
    };

    return {
      title: `${job.title} - ${job.contacts.city}`,
      description: job.description,
      openGraph: {
        title: job.title,
        description: job.description,
        url: `https://kinscare.org/jobs/${id}`,
        images: [
          {
            url:
              job.profileImage ||
              "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
            alt: `${job.title} logo`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: job.title,
        description: job.description,
        images: [
          job.profileImage ||
            "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
        ],
      },
      
    };
  } catch (error) {
    console.error("Failed to fetch job details for metadata", error);
    return {
      title: "Job Details - Kinscare",
      description: "Explore job opportunities with Kinscare.",
    };
  }
}

async function page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <div className="mt-10">
      
      <Suspense fallback={<JobDetailSkeleton />}>
        <div className="bg-white ">
          <JobDetails jobID={id} />
        </div>
      </Suspense>
    </div>
  );
}

export default page;
