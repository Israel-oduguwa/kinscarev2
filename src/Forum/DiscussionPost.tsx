import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { QuoteProvider } from "@/lib/context/QuoteContext";
import { generateAvatarData } from "@/lib/ui_utils";
import { formatDistanceToNow } from "date-fns";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { MessageSquare, ThumbsUp } from "lucide-react";
import React, { ReactNode, Suspense } from "react";
import Comments from "./Comments";
import PostMenuActions from "./PostMenuActions";
import LikeComponent from "./UpdateForum/LikeComponent";

polyfill();

function DiscussionPost({ posts, threadID }: any) {
  // console.log(posts)
  return (
    <>
      <QuoteProvider>
        {posts.map(
          (post: {
            likesCount: any;
            replies: ReactNode;
            updatedAt: string | number | Date;
            edited: boolean;
            content: string;
            createdAt: string | number | Date;
            _id: React.Key | null | undefined;
          }) => {
            const { author }: any = post;
            const avatarData = generateAvatarData(
              `${author.fname} ${author.lname}`
            );
            return (
              <div
                key={post._id}
                className="w-full rounded-lg p-6 mb-6 shadow-sm bg-white dark:bg-slate-900"
              >
                <div className="flex w-full justify-between">
                  <div className="flex gap-2 mb-3 items-center">
                    <Avatar className="border-gray-50 shadow-sm">
                      <AvatarImage src="https://canny.io/images/f9bc056c510b83265be76899e7a13028.png" />
                      <AvatarFallback
                        style={{ background: avatarData.gradient }}
                        className="border-gray-50"
                      >
                        {avatarData.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm mb-1 text-gray-900 font-semibold antialiased">
                        {author.fname} {author.lname}
                      </p>
                      <p className="text-xs text-gray-600 antialiased">
                        {post?.edited && "Edited"}{" "}
                        {formatDistanceToNow(
                          new Date(
                            post?.updatedAt ? post.updatedAt : post.createdAt
                          ),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    <PostMenuActions
                      content={post.content}
                      authorID={author.userID}
                      postID={post._id}
                    />
                  </div>
                </div>
                <div className="discussion-content mb-6 prose prose-h1:my2 prose-h3:my-2  lg:prose-lg md:prose-md sm:prose-sm transition-max-height duration-300 ease-in-out">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                <div className="flex gap-2 items-baseline">
                  <div className="flex  justify-between text-gray-600">
                    <LikeComponent
                      threadID={post._id}
                      initialLikeCount={post?.likesCount}
                      type="post"
                      size="sm"
                      section="reply"
                    />
                  </div>
                  <details open className="w-full flex">
                    <summary className="flex items-center space-x-1 text-sm font-medium mb-1 cursor-pointer">
                      <MessageSquare size={20} strokeWidth={1.5} />
                      <span>{post.replies} Replies</span>
                    </summary>
                    <div className="mt-2">
                      <Suspense fallback={<p>.</p>}>
                        <Comments threadID={threadID} postID={post._id} />
                      </Suspense>
                    </div>
                  </details>
                </div>
              </div>
            );
          }
        )}
      </QuoteProvider>
    </>
  );
}

export default DiscussionPost;
