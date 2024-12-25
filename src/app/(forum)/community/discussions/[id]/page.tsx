import { buttonVariants } from "@/components/ui/button";
import Discussion from "@/Forum/Discussion";
import DiscussionPosts from "@/Forum/DiscussionPosts";
import ForumDynamicNavbar from "@/Forum/Navbar/ForumDynamicNavbar";
import ForumNavbar from "@/Forum/Navbar/ForumNavbar";
import LeftFilter from "@/Forum/UI/LeftFilter";
import { QuoteProvider } from "@/lib/context/QuoteContext";
import Link from "next/link";
import { Suspense } from "react";
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  return (
    <div className="bg-gray-100 py-20 min-h-screen">
      <div className="max-w-screen-2xl mx-auto">
        {/* Responsive layout: flex on large screens, stacked on small */}
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4 sticky top-20 w-full p-4 rounded-lg">
            <LeftFilter />
          </aside>
          {/* Left Side: Discussion and Posts */}
          <div className=" lg:w-3/5 w-full mx-auto z-10  dark:bg-gray-900 space-y-6">
            <div className="relative w-full h-fit p-4 rounded-lg">
              <Suspense fallback={<p>Loading feed...</p>} >
                <Discussion threadID={id} />
              </Suspense>
            </div>

            <div className="relative w-full h-fit p-4 rounded-lg">
              <Suspense fallback={<p>Loading feed...</p>}>
                <DiscussionPosts threadID={id} />
              </Suspense>
            </div>
          </div>
          {/* Right Side: Add Post UI */}
          <div className="lg:w-1/4 w-full h-fit mt-4 sticky top-24 bg-white shadow-lg p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              Create new discussion
            </h2>
            <Link
              className={buttonVariants({
                className: "w-full mt-4 mb-6",
              })}
              href="/community/create"
            >
              New Discussion
            </Link>
            {/* <form className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Post Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter the post title"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Post Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Write your post content here..."
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Submit Post
                </button>
              </div>
            </form> */}
          </div>
        </div>
      </div>
    </div>
  );
}
