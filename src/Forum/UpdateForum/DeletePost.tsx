import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useApiClient } from "@/hooks/useApiClient";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeletePost({
  postID,
  usage,
  close,
}: {
  postID: string;
  usage: string;
  close: any;
}) {
  const authData = useAuthContext();
  const router = useRouter();
  const { contactData }: any = authData;
  const { loginToast }: any = useCustomToast();
  const { privateApi } = useApiClient();
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      const payload: any = {
        userID: contactData.userID,
      };
      const postEndPoint = `v1/forum/posts/${postID}`;
      const replyEndPoint = `v1/forum/replies/${postID}`;
      const { data } = await privateApi.post(`/api/${
          usage === "comments" ? replyEndPoint : postEndPoint
        }`,
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
      console.log(err);
      toast({
        title: err.message,
        description: "could not delete post",
        variant: "destructive",
      });
    },
    onSuccess: (data: any) => {
      console.log(data);
      close();
      // lets refresh the page to update the User interface
      // Which takes a lot of time to update
      router.refresh();

      // use the data.threadId
      //   We can run any function to track the users on segment or GTM
      toast({
        title: "Post deleted successfully",
        description: "...",
        variant: "default",
      });
      // we would update the state of the user
    },
  });
  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-1">
          Delete {usage === "comments" ? "comment" : "post"}
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this{" "}
          {usage === "comments" ? "comment" : "post"}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="ghost" onClick={() => close()} className="py-0 m-0">
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => createPost()}
          className="py-1 px-6"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Delete Comment
        </Button>
      </DialogFooter>
    </>
  );
}
