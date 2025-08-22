import { useCustomToast } from "@/app/hooks/use-custom-toast";
import MongoContext from "@/app/MongoContext";
import TextEditor from "@/components/Editor";
import QuoteEditor from "@/components/QuoteEditor";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { CreateDiscussionPostPayload } from "@/lib/validators/discussionSchema";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

export default function UpdatePost({
  postID,
  content,
  usage,
  close,
}: {
  postID: string;
  content: string;
  usage: string;
  close: any;
}) {
  const [postContent, setPostContent] = useState(content);
  const mongodb = useContext(MongoContext);
  const router = useRouter();
  const { user }: any = mongodb;
  const { loginToast }: any = useCustomToast();
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateDiscussionPostPayload = {
        userID: user.customData.userID,
        content: postContent,
        threadId: "",
      };
      const postEndPoint = `v1/forum/posts/${postID}`;
      const replyEndPoint = `v1/forum/replies/${postID}`;
    //   console.log(replyEndPoint)
      // console.log("jo");
      const { data } = await axios.put(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/${usage === "comments" ? replyEndPoint : postEndPoint}`,
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
      close();
      setPostContent("");
      // lets refresh the page to update the User interface
      // Which takes a lot of time to update
      router.refresh();

      // use the data.threadId
      //   We can run any function to track the users on segment or GTM
      toast({
        title: "Post updated successfully",
        description: "...",
        variant: "default",
      });
      // we would update the state of the user
    },
  });
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogDescription>
          Make changes to your post here. Click update when you're done.
        </DialogDescription>
      </DialogHeader>
      <div className="w-full">
        <QuoteEditor
          // usage="posts"
          onChange={setPostContent}
          initialContent={postContent}
          editorID={""}
          postID={""}
        />
      </div>
      <DialogFooter>
        <Button
          variant="default"
          onClick={() => createPost()}
          className="py-1 px-6"
          disabled={postContent.length === 0 || isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </DialogFooter>
    </>
  );
}
