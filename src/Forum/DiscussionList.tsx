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
//     `http://localhost:8081/api/v1/forum/threads?page=${page}&limit=${limit}`
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
  const url = `http://localhost:8081/api/v1/forum/threads?page=${page}&limit=10${
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
  // console.log(response.threads, "sjhs");
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Community
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-[family:var(--header-font)] font-extrabold text-slate-900">
          Community Discussions
        </h1>
        <p className="text-slate-600 mt-2">
          Join the conversation and share your knowledge
        </p>
      </div>

      {response.threads.map((thread: any) => {
        const avatarData = generateAvatarData(
          `${thread.creator?.fname} ${thread.creator?.lname}`
        );
        return (
          <Link key={thread._id} href={`/community/discussions/${thread._id}`}>
            <div className="p-5 mb-4 bg-white/80 border border-white/70 rounded-3xl shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)] hover:shadow-[0_22px_50px_-32px_rgba(15,23,42,0.45)] transition-all backdrop-blur">
              <div className="flex gap-3">
                {/* Author avatar */}
                <div className="shrink-0">
                  <ProfileAvatar
                    size="w-9 h-9"
                    name={`${thread.fname} ${thread.lname}`}
                    profileImage={
                      thread.creator ? thread.creator.profileImage : ""
                    }
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 truncate">
                    {thread.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {thread.creator.fname} {thread.creator.lname}
                  </p>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {thread.categories.map((category: any) => (
                      <span
                        key={category}
                        className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="text-slate-500">
                      {thread.views} views • {thread.replies} replies
                    </div>
                    <div className="text-slate-500">
                      {formatDistanceToNow(new Date(thread.updatedAt))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      <div className="flex justify-center mt-6 gap-3">
        {page > 1 && (
          <Link href={`/community?page=${page - 1}`}>
            <button className="px-4 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-700 shadow-sm">
              Previous
            </button>
          </Link>
        )}
        {page < pages && (
          <Link href={`/community?page=${page + 1}`}>
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700">
              Next
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
