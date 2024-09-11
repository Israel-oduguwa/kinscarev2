"use client";
import React, { useState } from "react";
import TextEditor from "@/components/Editor";
import { useContext } from "react";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { CloudUpload, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { CreateDiscussionPostPayload } from "@/lib/validators/discussionSchema";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { useCustomToast } from "@/app/hooks/use-custom-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

function CreatePosts({ threadId }: any) {
  const [postContent, setPostContent] = useState("");
  const mongodb = useContext(MongoContext);
  const router:any = useRouter();
  const { user }: any = mongodb;
  const { loginToast }: any = useCustomToast();
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateDiscussionPostPayload = {
        userID: user.customData.userID,
        content: postContent,
        threadId,
      };
      console.log(payload);
      const { data } = await axios.post(
        `https://api.kinscare.org/api/v1/forum/threads/posts/reply`,
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
      console.log(data);
      setPostContent("");
      // lets refresh the page to update the User interface
      // Which takes a lot of time to update
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
  const routeUnauthenticated = () => {
    localStorage.setItem('callbackUrl', router.asPath); // Store the current URL
    router.push("/signin")
  };
  return (
    <div className="w-full border border-gray-300 rounded-md p-2">
      <div className="mb-2  ">
        <TextEditor
          usage="posts"
          onChange={setPostContent}
          initialContent={postContent}
        />
      </div>
      <div className="flex justify-end">
        {user && user.customData.userID ? (
          <Button
            variant="default"
            onClick={() => createPost()}
            className="py-1 px-6"
            disabled={postContent.length === 0 || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={routeUnauthenticated}
            className="py-1 px-6"
            disabled={postContent.length === 0 || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post
          </Button>
        )}
      </div>
    </div>
  );
}

export default CreatePosts;
