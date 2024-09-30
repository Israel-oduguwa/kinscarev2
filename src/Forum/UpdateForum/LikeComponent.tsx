"use client";
import MongoContext from "@/app/MongoContext";
import axios, { AxiosError } from "axios";
import React, { useContext, useEffect, useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Utility for conditional class names

function LikeComponent({
  threadID,
  type,
  initialLikeCount,
  section,
  size = "base",
}: any) {
  const mongo = useContext(MongoContext);
  const { user }: any = mongo;

  // Ensure the likeCount is at least 0 to avoid NaN
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount || 0);
  const [isLiked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch like status to check if the user has already liked the post
  const fetchLikeStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.kinscare.org/api/v1/forum/like/${type}/${threadID}/${user.customData.userID}`
      );
      setLiked(res.data.liked); // Set liked status
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch like status:", error);
    }
  };

  useEffect(() => {
    if (user && user.customData.userID) {
      fetchLikeStatus();
    }
  }, [user, router]);

  const { mutate: likeItem } = useMutation({
    mutationFn: async () => {
      const payload: { userID: string } = {
        userID: user.customData.userID,
      };
      const { data } = await axios.post(
        `https://api.kinscare.org/api/v1/forum/like/${type}/${threadID}`,
        payload
      );
      return data;
    },
    onError: (err) => {
      setLiked(false); // Revert like state on failure
      setLikeCount((prev) => (prev > 0 ? prev - 1 : 0)); // Revert count
      if (err instanceof AxiosError) {
        toast({
          title: err.message,
          description: "Could not like post",
          variant: "destructive",
        });
      }
    },
    onMutate: () => {
      // Optimistically update UI
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    },
    onSuccess: () => {
        router.refresh()
      toast({
        title: "Liked post successfully",
        description: "liked",
        variant: "default",
      });
    },
  });

  const { mutate: removeLike } = useMutation({
    mutationFn: async () => {
      const payload: { userID: string } = {
        userID: user.customData.userID,
      };
      const { data } = await axios.post(
        `https://api.kinscare.org/api/v1/forum/like/${type}/${threadID}/remove`,
        payload
      );
      return data;
    },
    onError: (err) => {
      setLiked(true); // Revert unlike state on failure
      setLikeCount((prev) => prev + 1); // Revert count
      if (err instanceof AxiosError) {
        toast({
          title: err.message,
          description: "Could not remove like",
          variant: "destructive",
        });
      }
    },
    onMutate: () => {
      // Optimistically update UI
      setLiked(false);
      setLikeCount((prev) => (prev > 0 ? prev - 1 : 0));
    },
    onSuccess: () => {
      toast({
        title: "Like removed",
        description: "Your like has been removed.",
        variant: "default",
      });
    },
  });

  return (
    <div
      className={cn("flex items-center space-x-2", {
        "text-sm": size === "sm",
        "text-xs": size === "xs",
        "text-base": size === "base",
        "text-lg": size === "lg",
      })}
    >
      <div
        onClick={isLiked ? () => removeLike() : () => likeItem()}
        className={cn(
          "flex items-center cursor-pointer justify-center border-none rounded-md transition-colors duration-200",
          isLiked
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300",
          loading && "cursor-not-allowed opacity-70",
          section === "reply" ? " px-2 py-2" : "px-3 py-3"
        )}
      >
        {loading ? (
          <span className="loader">.</span>
        ) : (
          <ThumbsUp
            className={cn(
              "transition-transform duration-200",
              isLiked
                ? "fill-current text-white"
                : "fill-current text-gray-600",
              size === "lg"
                ? "w-5 h-5"
                : section === "reply"
                  ? "w-3 h-3"
                  : "w-4 h-4", // Adjust icon size based on prop
              "mr-0"
            )}
          />
        )}
      </div>
      <p className="font-semibold">
        {likeCount}
      </p>
    </div>
  );
}

export default LikeComponent;
