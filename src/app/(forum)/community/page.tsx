import ForumNavbar from "@/Forum/Navbar/ForumNavbar";
import React from "react";
import Footer from "@/WebPages/Footer";
import DiscussionList from "@/Forum/DiscussionList";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
// this is the discussion page for the forum

function page() {
  return (
    <>
      <header>
        <ForumNavbar />
      </header>
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-4">
          {/* Responsive layout: flex on large screens, stacked on small */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side: Discussion and Posts */}
            <section className="max-w-7xl w-full mx-auto p-4 mt-20 dark:bg-gray-900">
                <p className="text-md font-semibold mb-4">Recent Forum Activity</p>
                {/* the top discussions user can click when entering the page for the first time paginated  */}
                <DiscussionList />
            </section>
            {/* Right Side: Add Post UI */}
            <div className="lg:w-1/3 mt-20 w-full  h-fit sticky top-10 bg-white shadow-lg p-4 rounded-lg">
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
      </main>
      <footer>{/* <Footer /> */}</footer>
    </>
  );
}

export default page;
