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
    <main className="bg-gray-50 min-h-screen">
      {/* JSON-LD scripts remain the same */}

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filters Drawer (Moved to top on mobile) */}
          <div className="lg:hidden">
            <LeftFilter params={searchParams} />
          </div>

          {/* Left Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <LeftFilter params={searchParams} />
          </aside>

          {/* Main Content */}
          <section className="flex-1 lg:max-w-3xl">
           

            <Suspense fallback={<DiscussionListSkeleton />}>
              <DiscussionList searchParams={searchParams} />
            </Suspense>
          </section>

          {/* Right Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-20">
              <div className="text-center">
                <div className="inline-block bg-blue-100 rounded-full p-3 mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start a Discussion
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Share your knowledge, ask questions, or start a new topic
                </p>
                <Link
                  className={buttonVariants({
                    className:
                      "w-full shadow-sm hover:shadow-md transition-shadow",
                    variant: "default",
                  })}
                  href="/community/create"
                >
                  Create Post
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ForumPage;
