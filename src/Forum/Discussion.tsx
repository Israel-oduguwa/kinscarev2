// This page is rendered on the server
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { generateAvatarData } from "@/lib/ui_utils";
import { AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import htmlTruncate from "html-truncate";
import { Bookmark, MessageCircleReply } from "lucide-react";
import { Suspense } from "react";
import CreatePosts from "./CreatePosts";
import RichTextRendering from "@/components/RichTextRendering";
import ThreadMenuAction from "./ThreadMenuAction";
import LikeComponent from "./UpdateForum/LikeComponent";
import ProfileAvatar from "@/components/ProfileAvatar";

async function Discussion({ threadID }: { threadID: string }) {
  let data = await fetch(
    `https://kinscare-backend.onrender.com/api/v1/forum/threads/${threadID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  const { thread, creator } = response;
  const avatarData = generateAvatarData(`${creator.fname} ${creator.lname}`);
  const truncatedContent = htmlTruncate(thread.content, 800, {
    ellipsis: "...",
  });
  // console.log(thread,"thread")

  return (
    <div className="rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-lg  w-full">
      <div className="p-6">
        <div className="flex items-center mb-6 gap-2">
          {/* <div className="vote border rounded-md border-gray-300">
          </div> */}
          <h1 className="font-bold antialiased text-gray-900 text-2xl ">
            {thread.title}
          </h1>
        </div>
        <div className="flex justify-between w-full">
          <div className="flex gap-2 mb-3 items-center">
            {/* <Avatar className="border-gray-50 shadow-sm">
              <AvatarImage src="https://lh3.googleusercontent.com/a/ACg8ocLhJ06zIepDHxUHhZ6_sW01qSutpYn8XzXPb9cbFkFOfmOdoOs=s192-c-mo" />
              <AvatarFallback
                style={{ background: avatarData.gradient }}
                className="border-gray-50"
              >
                {avatarData.initials}
              </AvatarFallback>
            </Avatar> */}
            <ProfileAvatar
              size="w-10 h-10"
              name={`${creator.fname} ${creator.lname}`}
              profileImage={creator.profileImage}
            />
            <div>
              <p className="text-sm mb-1 text-gray-900 font-semibold antialiased">
                {creator.fname} {creator.lname}
              </p>
              <p className="text-xs text-gray-600 antialiased">
                {formatDistanceToNow(new Date(thread.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <ThreadMenuAction threadID={thread._id} authorID={creator.userID} />
        </div>
        <div>
          <div className="discussion-content mb-8">
            <RichTextRendering
              truncatedContent={truncatedContent}
              fullContent={thread.content}
            />
            {/* <Interweave content={truncatedContent} /> */}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {thread.categories.map((category: string, index: number) => (
              <div
                key={index}
                className="text-sm bg-slate-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg py-1.5 px-3"
              >
                {category}
              </div>
            ))}
            {thread.tags.map((tag: string, index: number) => (
              <div
                key={index}
                className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg py-1.5 px-3"
              >
                {tag}
              </div>
            ))}
          </div>
          <div>
            <LikeComponent
              threadID={threadID}
              initialLikeCount={thread?.likesCount}
              type="thread"
              size="lg"
            />
          </div>
        </div>
      </div>
      <div className="p-3 border-t border-t-gray-100 bg-gray-50">
        <Suspense fallback={<h1>loading</h1>}>
          <p className="font-semibold text-gray-900 text-sm mb-1">Reply</p>
          <CreatePosts threadId={thread._id} />
        </Suspense>
      </div>
    </div>
  );
}

export default Discussion;
