// DiscussionList.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { generateAvatarData } from "@/lib/ui_utils";
import { formatDistanceToNow } from "date-fns";
import { MessageCircleReply } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 10;

async function getThreads(page: number, limit: number) {
  const response = await fetch(
    `http://kinscare-dev.us-east-1.elasticbeanstalk.com/api/v1/forum/threads?page=${page}&limit=${limit}`
  );
  return response.json();
}

export default function DiscussionList() {
  const [threads, setThreads] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadThreads = async () => {
    setIsLoading(true);
    try {
      const { data, pagination } = await getThreads(page, ITEMS_PER_PAGE);
      setThreads((prevThreads) => [...prevThreads, ...data]);
      setHasMore(page < pagination.totalPages);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error loading threads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);
  // console.log(threads)
  return (
    <div>
      {threads.map((thread: any) => {
        const avatarData = generateAvatarData(
          `${thread.creator?.fname} ${thread.creator?.lname}`
        );
        return (
          <Link href={`/community/discussions/${thread._id}`}>
            <div
              key={thread._id}
              className="p-4 mb-4 flex gap-4 flex-col md:flex-row items-center bg-white dark:bg-gray-800 border border-gray-50 dark:border-gray-700 rounded-lg shadow-md max-w-full md:max-w-5xl"
            >
              <div className="flex flex-col justify-between py-3 px-1 leading-normal w-full">
                <div>
                  <h1 className="text-xl mb-3 font-semibold  tracking-tight text-gray-900 dark:text-white">
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
                      <Avatar className="border-gray-50 shadow-sm">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback
                          style={{ background: avatarData.gradient }}
                          className="border-gray-50"
                        >
                          {avatarData.initials}
                        </AvatarFallback>
                      </Avatar>
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
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {thread.views} Views
                      </p>
                      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <MessageCircleReply className="mr-1" />
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
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button onClick={loadThreads} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
