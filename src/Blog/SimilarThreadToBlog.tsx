"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton"; // Adjust the import path if needed

// Define the type for a forum thread.
interface Thread {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  createdAt?: string;
}

interface SimilarThreadToBlogProps {
  slug: string;
}

function SimilarThreadToBlog({ slug }: SimilarThreadToBlogProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarThreads = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `"https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/blogs/get-thread-similar-to-article/${slug}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch similar threads");
        }
        const data = await res.json();
        setThreads(data.similarThreads || []);
      } catch (err: any) {
        console.error(err);
        setError(
          err.message || "An error occurred while fetching similar threads."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarThreads();
  }, [slug]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Related Forum Threads
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
              <Skeleton className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">Error: {error}</p>
      ) : threads.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No related forum threads found.
        </p>
      ) : (
        <ul className="space-y-4">
          {threads.map((thread) => (
            <li
              key={thread._id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <Link
                href={`/community/discussions/${thread._id}`}
                className="block"
              >
                <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {thread.title}
                </span>
              </Link>

              {/* Optional Excerpt */}
              {thread.content && (
                <p
                  dangerouslySetInnerHTML={{ __html: thread.content }}
                  className="text-gray-700 dark:text-gray-300 text-sm mt-1 line-clamp-3 text-ellipsis"
                ></p>
              )}

              {/* Creation Date */}
              {thread.createdAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(thread.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SimilarThreadToBlog;
