"use client";

import React, { useState } from "react";
import { toast } from "sonner"; // shadcn toast
import Image from "next/image";
import Link from "next/link";
import { Clock, Flame } from "lucide-react";

const API_URL = "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/blogs/all";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  author: {
    name: string;
    profilePicture: string;
  };
  createdAt: string;
}

interface BlogListProps {
  initialBlogs: Blog[];
  totalPages: number;
}

const BlogList: React.FC<BlogListProps> = ({ initialBlogs, totalPages }) => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [page, setPage] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(totalPages > 1);
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  // **Load More Blogs Based on Sort Option**
  const fetchMoreBlogs = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}?sortBy=${sortBy}&page=${page}&limit=10`
      );
      if (!res.ok) throw new Error("Failed to load more blogs");

      const data = await res.json();
      if (data.blogs.length === 0) {
        setHasMore(false);
      } else {
        setBlogs((prev) => [...prev, ...data.blogs]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading more blogs:", error);
      toast.error("Failed to load more blogs. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // **Fetch Blogs When Sorting Changes**
  const handleSortChange = async (newSort: "recent" | "popular") => {
    if (sortBy === newSort) return;

    setSortBy(newSort);
    setPage(1);
    setLoading(true);
    // setHasMore(true);

    try {
      const res = await fetch(`${API_URL}?sortBy=${newSort}&page=1&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch blogs");

      const data = await res.json();
      setBlogs(data.blogs);
    } catch (error) {
      toast.error("Failed to fetch blogs.");
    } finally {
      setLoading(false);
    }
  };
// console.log("This is blog", blogs)
  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Blog
          </p>
          <h2 className="text-2xl md:text-4xl font-[family:var(--header-font)] font-extrabold text-slate-900">
            Latest Articles
          </h2>
          <p className="text-slate-600 text-lg">
            Insights and stories from our community
          </p>
        </div>

        {/* Sort Tabs */}
        <div className="bg-white/80 rounded-xl p-1.5 shadow-sm border border-white/70 backdrop-blur flex">
          <button
            onClick={() => handleSortChange("recent")}
            className={`px-6 py-2 flex items-center gap-2 rounded-lg transition-all ${
              sortBy === "recent"
                ? "bg-blue-50 shadow-sm text-blue-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-medium text-sm">Recent</span>
          </button>
          <button
            onClick={() => handleSortChange("popular")}
            className={`px-6 py-2 flex items-center gap-2 rounded-lg transition-all ${
              sortBy === "popular"
                ? "bg-blue-50 shadow-sm text-blue-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Flame className="h-4 w-4" />
            <span className="font-medium text-sm">Popular</span>
          </button>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <article
            key={blog._id}
            className="group relative bg-white/80 rounded-3xl shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-white/70 backdrop-blur"
          >
            <Link href={`/blog/${blog.slug}`} className="h-full flex flex-col">
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden flex-shrink-0">
                <Image
                  src={blog.featuredImage}
                  alt={blog.title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/40" />
              </div>

              {/* Content Container - Fixed Height */}
              <div className="p-6 flex flex-col flex-grow h-full space-y-4">
                <h3 className="text-xl font-bold text-slate-900 leading-snug line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-slate-600 text-sm font-light line-clamp-3 leading-relaxed flex-grow">
                  {blog.excerpt}
                </p>

                {/* Author Section - Always at Bottom */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/70">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-slate-400 blur opacity-20 group-hover:opacity-30 transition-opacity" />
                    <Image
                      src={blog.author.profilePicture}
                      alt={blog.author.name}
                      width={48}
                      height={48}
                      className="relative rounded-full border-2 border-white"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {blog.author.name}
                    </p>
                    <time className="text-sm text-slate-500">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={fetchMoreBlogs}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="flex items-center gap-2">
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {!hasMore && (
        <p className="text-center text-slate-500 mt-8 py-6 border-t border-white/70">
          You've reached the end! 🎉
        </p>
      )}
    </div>
  );
};

export default BlogList;
