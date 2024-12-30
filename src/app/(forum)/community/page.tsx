import DiscussionList from "@/Forum/DiscussionList";
import ForumDynamicNavbar from "@/Forum/Navbar/ForumDynamicNavbar";
import ForumNavbar from "@/Forum/Navbar/ForumNavbar";
import LeftFilter from "@/Forum/UI/LeftFilter";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import Head from "next/head";

interface ForumPageProps {
  searchParams: Promise<{
    page?: string;
    popular?: string;
    tags?: string;
    sortBy?: string;
    sortOrder?: string;
    category?: string;
  }>;
}

async function getThreads(queryParams: {
  page?: string;
  popular?: string;
  tags?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
  sortReplies?: string;
}) {
  const {
    page = "1",
    popular,
    category,
    tags,
    sortBy,
    sortReplies,
    sortOrder = "desc",
  } = queryParams;
  const url = `https://api.kinscare.org/api/v1/forum/threads?page=${page}&limit=10${
    sortReplies ? `&sortReplies=${sortReplies}` : ""
  }${popular ? "&popular=1" : ""}${category ? `&categories=${category}` : ""}${
    tags ? `&tags=${tags}` : ""
  }${sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ""}`;
  console.log(url);
  const response = await fetch(url, {
    cache: "no-cache",
  });
  return response.json();
}

async function page(props: ForumPageProps) {
  const searchParams = await props.searchParams;
  const response = await getThreads(searchParams);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: "Join the Discussion on Our Forum",
    description:
      "Participate in engaging discussions, share your thoughts, and ask questions on our community forum.",
    mainEntity: {
      "@type": "Question",
      name: "How do I participate in the forum?",
      text: "Engage with other members by replying to discussions or starting a new thread.",
    },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: response?.pagination?.total || 0,
    },
  };

  return (
    <>
      <Head>
        <title>Community Forum | Engage in Discussions & Share Insights</title>
        <meta
          name="description"
          content="Join our forum to participate in meaningful discussions, ask questions, and share insights with like-minded individuals."
        />
        <meta
          name="keywords"
          content="forum, community, discussions, Q&A, share ideas, participate"
        />
        <meta name="author" content="Kinscare" />
        <meta property="og:title" content="Community Forum | Kinscare" />
        <meta
          property="og:description"
          content="Engage in thoughtful discussions and share your insights with our community on Kinscare Forum."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kinscare.org/forum" />
        <meta property="og:image" content="/images/forum-banner.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kinscare Community Forum" />
        <meta
          name="twitter:description"
          content="Join the conversation on the Kinscare Community Forum."
        />
        <meta name="twitter:image" content="/images/forum-banner.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </Head>
      <main className="bg-gray-100 py-20 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-8">
          {/* Responsive layout: flex on large screens, stacked on small */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <aside className="hidden lg:block lg:col-span-2">
            <LeftFilter params={searchParams} />
            </aside>

            {/* Main Content */}
            <section className="col-span-12 lg:col-span-7">
              <div className="bg-white shadow-sm rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Discussions
                </h2>
                <Suspense fallback={<div>Loading discussions...</div>}>
                  <DiscussionList
                    threads={response.threads}
                    pagination={response.pagination}
                  />
                </Suspense>
              </div>
            </section>

            {/* Right Sidebar */}
            <aside className="col-span-12 lg:col-span-3">
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
    </>
  );
}

export default page;
