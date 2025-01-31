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
      {response.threads.map((thread: any) => {
        const avatarData = generateAvatarData(
          `${thread.creator?.fname} ${thread.creator?.lname}`
        );
        return (
          <Link key={thread._id} href={`/community/discussions/${thread._id}`}>
            <div className="p-4 mb-4 flex gap-4 flex-col md:flex-row items-center bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700 rounded-lg shadow-sm max-w-full md:max-w-5xl">
              <div className="flex flex-col justify-between py-3 px-1 leading-normal w-full">
                <div>
                  <h1 className="text-xl mb-3 font-semibold tracking-tight text-gray-800 dark:text-white">
                    {thread.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {thread.categories.map(
                      (category: string, index: number) => (
                        <div
                          key={index}
                          className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg py-1 px-3"
                        >
                          {category}
                        </div>
                      )
                    )}
                    {thread.tags.map((tag: string, index: number) => (
                      <div
                        key={index}
                        className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg py-1.5 px-3"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-3 mb-3 items-center">
                      <ProfileAvatar
                        size="w-12 h-12"
                        name={`${thread.fname} ${thread.lname}`}
                        profileImage={thread.creator.profileImage}
                      />
                      <div>
                        <p className="text-sm mb-1 text-gray-900 font-semibold antialiased">
                          {thread.creator.fname} {thread.creator.lname}
                        </p>
                        <p className="text-xs text-gray-600 antialiased">
                          {formatDistanceToNow(new Date(thread.updatedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm antialiased text-gray-700 dark:text-gray-300">
                        {thread.views} Views
                      </p>
                      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <MessageCircleReply size={20} className="mr-1" />
                        {thread.replies}
                      </div>
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
