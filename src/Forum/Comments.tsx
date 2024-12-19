import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarData } from "@/lib/ui_utils";
import React from "react";
import PostComments from "./PostComments";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { formatDistanceToNow } from "date-fns";
import PostMenuActions from "./PostMenuActions";
import { Separator } from "@/components/ui/separator";
import LikeComponent from "./UpdateForum/LikeComponent";
import ProfileAvatar from "@/components/ProfileAvatar";

polyfill();

async function Comments({ postID, threadID }: any) {
  let data = await fetch(
    `https://api.kinscare.org/api/v1/forum/posts/${postID}/replies`,
    { cache: "no-cache" }
  );

  const response = await data.json();
  const { replies }: any = response;
  console.log(replies, "there are replies");
  return (
    <div className="ml-4 relative ">
      {" "}
      {/* Margin to indent nested comments */}
      {replies && replies.length > 0 ? (
        replies.map((reply: any) => {
          const { author, authorData } = reply;
          const avatarData = generateAvatarData(
            `${author.fname} ${author.lname}`
          );

          return (
            <div key={reply._id} className="flex flex-col mt-6 relative">
              {/* Threadline before each comment */}
              {/* <div className="absolute left-[1.1rem] top-0 bottom-0 w-px bg-gray-300" /> */}
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <ProfileAvatar
                  size="w-12 h-12"
                  name={`${author.fname} ${author.lname}`}
                  profileImage={authorData.profileImage}
                />

                {/* Comment Content */}
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-900 font-semibold">
                        {author.fname} {author.lname}
                      </p>
                      <p className="text-xs text-gray-600">
                        {reply?.edited && "Edited"}{" "}
                        {formatDistanceToNow(
                          new Date(reply.updatedAt || reply.createdAt),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <PostMenuActions
                        content={reply.content}
                        authorID={author.userID}
                        replyID={reply._id}
                        usage="comments"
                        postID={postID}
                      />
                    </div>
                  </div>
                  <div className="prose prose-blockquote:text-gray-500  prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-sm prose-gray">
                    <Interweave content={reply.content} />
                  </div>
                  <div>
                    <LikeComponent
                      threadID={reply._id}
                      initialLikeCount={reply?.likesCount}
                      type="post"
                      size="xs"
                      section="reply"
                    />
                  </div>
                  {/* Nested Replies */}
                  {reply.replies && reply.replies.length > 0 && (
                    <div className="mt-4 pl-8">
                      <Comments postID={reply._id} threadID={threadID} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p>No replies yet.</p>
      )}
      <PostComments threadId={threadID} postID={postID} />
    </div>
  );
}

export default Comments;
