import DiscussionList from "@/Forum/DiscussionList";
import LeftFilter from "@/Forum/UI/LeftFilter";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DiscussionListSkeleton = () => {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="p-4 mb-4 flex gap-4 flex-col md:flex-row items-center bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700 rounded-lg shadow-sm max-w-full md:max-w-5xl"
        >
          <div className="flex flex-col justify-between py-3 px-1 leading-normal w-full">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: 3 }).map((_, tagIndex) => (
                <Skeleton
                  key={tagIndex}
                  className="h-6 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg"
                />
              ))}
            </div>
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-3 mb-3 items-center">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-center mt-4 space-x-4">
        <Skeleton className="h-10 w-20 rounded bg-gray-200" />
        <Skeleton className="h-10 w-20 rounded bg-gray-200" />
      </div>
    </div>
  );
};

export const metadata = {
  title: "Kinscare Forum - Connect Providers & Caregivers",
  description:
    "Join the Kinscare Forum to connect with providers and caregivers, ask questions, share knowledge, and build a supportive community.",
  openGraph: {
    title: "Kinscare Forum - Connect Providers & Caregivers",
    description:
      "Join the Kinscare Forum to connect with providers and caregivers, ask questions, share knowledge, and build a supportive community.",
    url: "https://kinscare.org/community",
    type: "website",
    images: ["https://kinscare.org/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kinscare Forum - Connect Providers & Caregivers",
    description:
      "Join the Kinscare Forum to connect with providers and caregivers, ask questions, share knowledge, and build a supportive community.",
    images: ["https://kinscare.org/og-image.jpg"],
  },
};

async function ForumPage({ searchParams }: { searchParams: any }) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Kinscare Forum?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kinscare Forum is a platform where providers and caregivers can connect, share knowledge, and participate in community discussions.",
        },
      },
      {
        "@type": "Question",
        name: "How do I create a discussion?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click the 'Create a Discussion' button in the sidebar, fill out the form, and submit your topic to start a conversation.",
        },
      },
      {
        "@type": "Question",
        name: "Is Kinscare Forum free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Kinscare Forum is completely free to use for all providers and caregivers.",
        },
      },
    ],
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://kinscare.org",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Community",
        item: "https://kinscare.org/community",
      },
    ],
  };

  return (
    <main className="bg-gray-100 py-10 min-h-screen">
      {/* JSON-LD for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <div className="max-w-screen-2xl mx-auto px-4 2xl:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="xl:col-span-2 col-span-12">
            <LeftFilter params={searchParams} />
          </aside>

          {/* Main Content */}
          <section className="col-span-12 xl:col-span-7">
            <Suspense fallback={<DiscussionListSkeleton />}>
              <DiscussionList searchParams={searchParams} />
            </Suspense>
          </section>

          {/* Right Sidebar */}
          <aside className="col-span-12 xl:col-span-3">
            <div className="bg-white shadow-sm rounded-xl p-6 sticky top-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Create a Discussion
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Share your thoughts, ask questions, or start a conversation.
              </p>
              <Link
                className={buttonVariants({
                  className: "w-full mt-4 mb-6 text-sm",
                })}
                href="/community/create"
              >
                New Discussion
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ForumPage;
