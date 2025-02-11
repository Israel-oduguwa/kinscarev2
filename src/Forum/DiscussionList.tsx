// DiscussionList.tsx
import ProfileAvatar from "@/components/ProfileAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarData } from "@/lib/ui_utils";
import { formatDistanceToNow } from "date-fns";
import { MessageCircleReply } from "lucide-react";
import Link from "next/link";
// import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 10;

// async function getThreads(page: number, limit: number) {
//   const response = await fetch(
//     `https://api.kinscare.org/api/v1/forum/threads?page=${page}&limit=${limit}`
//   );
//   return response.json();
// }

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
  const response = await fetch(url, { cache: "no-cache" });
  return response.json();
}

export default async function DiscussionList({
  searchParams,
}: {
  searchParams: any;
}) {
  const response = await getThreads(searchParams);
  const { page, pages } = response.pagination;
  // console.log(threads, "sjhs");
  return (
    <div>
      <h2 className="text-2xl tracking-tight font-bold text-gray-800 mb-6">
        Community Discussions
      </h2>

      {response.threads.map((thread: any) => {
        const avatarData = generateAvatarData(
          `${thread.creator?.fname} ${thread.creator?.lname}`
        );
        return (
          <Link key={thread._id} href={`/community/discussions/${thread._id}`}>
            <div className="p-6 mb-6 flex flex-col md:flex-row items-start bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200">
              {/* Left Side: Thread Content */}
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 hover:text-blue-600 transition">
                  {thread.title}
                </h1>

                {/* Tags & Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {thread.categories.map((category: string, index: number) => (
                    <span
                      key={index}
                      className="text-xs  bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-gray-300 rounded-full py-1 px-3"
                    >
                      {category}
                    </span>
                  ))}
                  {thread.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="text-xs  bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full py-1 px-3"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author Info & Metadata */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-4">
                    {/* Profile Avatar */}
                    <ProfileAvatar
                      size="w-12 h-12"
                      name={`${thread.fname} ${thread.lname}`}
                      profileImage={thread.creator.profileImage}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {thread.creator.fname} {thread.creator.lname}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(new Date(thread.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Thread Stats (Views & Replies) */}
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {thread.views} Views
                    </p>
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <MessageCircleReply size={18} className="mr-1" />
                      {thread.replies}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      <div className="flex justify-center mt-4">
        {page > 1 && (
          <Link href={`/community?page=${page - 1}`}>
            <button className="px-4 py-2 bg-gray-200 rounded">Previous</button>
          </Link>
        )}
        {page < pages && (
          <Link href={`/community?page=${page + 1}`}>
            <button className="px-4 py-2 bg-gray-200 rounded">Next</button>
          </Link>
        )}
      </div>
    </div>
  );
}
