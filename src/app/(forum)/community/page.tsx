import DiscussionList from "@/Forum/DiscussionList";
import ForumNavbar from "@/Forum/Navbar/ForumNavbar";
import LeftFilter from "@/Forum/UI/LeftFilter";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

interface ForumPageProps {
  searchParams: {
    page?: string;
    popular?: string;
    tags?: string;
    sortBy?: string;
    sortOrder?: string;
    category?: string;
  };
}

// Fetch data based on query parameters (SSR)
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
  const url = `http://localhost:8081/api/v1/forum/threads?page=${page}&limit=10${sortReplies ? `&sortReplies=${sortReplies}` : ""} ${popular ? "&popular=1" : ""}${category ? `&categories=${category}` : ""}${
    tags ? `&tags=${tags}` : ""
  }${sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ""}`;
  console.log(url);
  const response = await fetch(url, {
    cache: "no-cache",
  });
  return response.json();
}

async function page({ searchParams }: ForumPageProps) {
  const response = await getThreads(searchParams);
  return (
    <>
      <header>
        <ForumNavbar />
      </header>

      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-screen-2xl mx-auto p-4">
          {/* Responsive layout: flex on large screens, stacked on small */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar: Filters for discussions */}
            <aside className="lg:w-1/5 w-full sticky top-20   p-4 rounded-lg">
              <LeftFilter params={searchParams} />
            </aside>
            {/* Middle: Discussion List */}
            <section className="lg:w-2/3 w-full z-10 mx-auto p-4 mt-20 dark:bg-gray-900">
              {/* List of discussions paginated */}
              <Suspense fallback={<div>Loading discussions...</div>}>
                <DiscussionList
                  threads={response.threads}
                  pagination={response.pagination}
                />
              </Suspense>
            </section>

            {/* Right Sidebar: Add New Discussion */}
            <div className="lg:w-1/5 w-full mt-20 h-fit sticky top-10 bg-white shadow-lg p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">
                Create a new discussion
              </h2>
              <Link
                className={buttonVariants({
                  className: "w-full mt-4 mb-6",
                })}
                href="/community/create"
              >
                New Discussion
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer>{/* <Footer /> */}</footer>
    </>
  );
}

export default page;
