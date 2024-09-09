import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarData } from "@/lib/ui_utils";
import React from "react";
import PostComments from "./PostComments";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import QuoteButton from "./OuoteButton";
import { formatDistanceToNow } from "date-fns";
import PostMenuActions from "./PostMenuActions";
import { Separator } from "@/components/ui/separator";
polyfill();
async function Comments({ postID, threadID }: any) {
  // console.log(postID, "sklk")
  let data = await fetch(
    `http://kinscare-dev.us-east-1.elasticbeanstalk.com/api/v1/forum/posts/${postID}/replies`,
    // { next: { revalidate:1 } }
    { cache: "no-cache" }
  );
  // So the discussion are refreshed every 60 minutes to prevent the excess update from the server
  const response = await data.json();
  const { replies }: any = response;
  console.log(replies);
  return (
    <div>
      {replies &&
        replies.map(
          (reply: {
            edited: string;
            _id: any;
            updatedAt: any;
            id: React.Key | null | undefined;
            author: {
              userID: any;
              fname:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<React.AwaitedReactNode>
                | null
                | undefined;
              lname:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<React.AwaitedReactNode>
                | null
                | undefined;
            };
            createdAt: string | number | Date;
            content: any;
            replies: any;
          }) => {
            return (
              <div className="mt-4">
                <Separator
                  className="border-gray-100"
                  orientation="horizontal"
                />
                <div
                  key={reply.id}
                  className={`flex flex-col ml-${4} pt-4 mb-1`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center mb-2">
                      <Avatar className="border-gray-50 shadow-sm">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback
                          style={{
                            background: generateAvatarData(
                              `${reply.author.fname} ${reply.author.lname}`
                            ).gradient,
                          }}
                          className="border-gray-50"
                        >
                          {
                            generateAvatarData(
                              `${reply.author.fname} ${reply.author.lname}`
                            ).initials
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm mb-1 text-gray-900 font-semibold antialiased">
                          {reply.author.fname} {reply.author.lname}
                        </p>
                        <p className="text-xs text-gray-600 antialiased">
                          {reply?.edited && "Edited"}{" "}
                          {formatDistanceToNow(
                            new Date(
                              reply?.updatedAt ? reply.updatedAt : reply.createdAt
                            ),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <PostMenuActions
                        content={reply.content}
                        authorID={reply.author.userID}
                        replyID={reply._id}
                        usage="comments"
                        postID={postID}
                      />
                    </div>
                  </div>
                  <div className="pl-10 prose prose-blockquote:text-gray-400 prose-blockquote:my-2 discussion-content prose-h1:my-2 prose-h3:my-2  lg:prose-lg md:prose-md sm:prose-sm transition-max-height duration-300 ease-in-out">
                    <Interweave content={reply.content} />
                  </div>
                </div>
              </div>
            );
          }
        )}
      <PostComments threadId={threadID} postID={postID} />
    </div>
  );
}

export default Comments;
