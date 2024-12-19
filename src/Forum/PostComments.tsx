"use client";
import { useCustomToast } from "@/app/hooks/use-custom-toast";
import MongoContext from "@/app/MongoContext";
import TextEditor from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CreateCommentPostPayload } from "@/lib/validators/discussionSchema";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import QuoteEditor from "@/components/QuoteEditor";

function PostComments({ postID, threadId }: any) {
  const [replyContent, setReplyContent] = useState("");
  const mongodb = useContext(MongoContext);
  const router:any = useRouter();
  const { user }: any = mongodb;
  const { loginToast }: any = useCustomToast();
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateCommentPostPayload = {
        userID: user.customData.userID,
        content: replyContent,
        threadId,
        parentId: postID,
      };
      // console.log(payload);
      const { data } = await axios.post(
        `https://api.kinscare.org/api/v1/forum/posts/${postID}/replies`,
        payload
      );
      //   console.log(data)
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: err.message,
            variant: "destructive",
          });
        }
        if (err.response?.status === 401) {
          return loginToast;
        }
      }
      toast({
        title: err.message,
        description: "could not create discussion",
        variant: "destructive",
      });
    },
    onSuccess: (data: any) => {
      // console.log(data);
      setReplyContent(""); // Empty the state
      // lets refresh the page to update the User interface
      router.refresh();
      // use the data.threadId
      //   We can run any function to track the users on segment or GTM
      toast({
        title: "Post created successfully",
        description: "...",
        variant: "default",
      });
      // we would update the state of the user
    },
  });
  // console.log(postID)
  const routeUnauthenticated = () => {
    localStorage.setItem("callbackUrl", router.asPath); // Store the current URL
    router.push("/signin");
  };
  return (
    <div className="w-full mt-4 ">
      <div className="mb-2">
        <QuoteEditor
          postID={postID}
          editorID={postID}
          onChange={setReplyContent}
          initialContent={replyContent}
        />
      </div>
      <div className="flex justify-end">
        {user && user.customData.userID ? (
          <Button
            variant="default"
            onClick={() => createPost()}
            className="py-1 px-6"
            disabled={replyContent.length === 0 || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reply post
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={routeUnauthenticated}
            className="py-0 px-6"
            disabled={replyContent.length === 0 || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reply post
          </Button>
        )}
      </div>
    </div>
  );
}

export default PostComments;
