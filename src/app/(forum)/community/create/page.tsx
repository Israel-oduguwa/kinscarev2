"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useContext } from "react";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { CreateThreadPayload } from "@/lib/validators/discussionSchema";
import MongoContext from "@/app/MongoContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useCustomToast } from "@/app/hooks/use-custom-toast";
import Editor from "@/components/Editor";
import CategoryChipInput from "@/components/ui/CategoryChipInput";

const categories = [
  "Programs",
  "RN program",
  "LPN program",
  "Physician Assistant",
  "Nurse",
  "Resume",
  "Technology",
  "Schools",
  "Jobs",
  "Questions",
];

const Page = () => {
  const [input, setInput] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const mongodb = useContext(MongoContext);
  const { user }: any = mongodb;
  const router = useRouter();
  const { loginToast }: any = useCustomToast();

  const { mutate: createThread, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateThreadPayload = {
        title: input,
        userID: user.customData.userID,
        categories: selectedCategories,
        content: content,
        tags: [],
      };
      const { data } = await axios.post(
        `https://kinscare-backend.onrender.com/api/v1/forum/threads`,
        payload
      );
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
        description: "Could not create discussion",
        variant: "destructive",
      });
    },
    onSuccess: (data: any) => {
      const newPathname = `/community/discussions/${data.threadId}`;
      toast({
        title: "Discussion Created Successfully 🎉",
        description: "Your discussion is now live!",
        variant: "default",
      });
      router.push(newPathname);
    },
  });

  return (
    <div className="bg-gray-100">
      <div className="container  mx-auto px-6 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Start a New Discussion
          </h1>
          <p className="text-gray-600 mt-2">
            Connect with the community by sharing your insights, asking
            questions, and engaging in meaningful discussions.
          </p>
        </div>

        {/* Discussion Form */}
        <div className="mt-8 max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
          {/* Discussion Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Discussion Title
            </label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 "
              placeholder="Enter a clear and engaging title"
            />
          </div>

          {/* Content Body */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Content Body
            </label>
            <Editor onChange={setContent} initialContent={content} usage={""} />
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700">
              Select Categories
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Categories help group your post for easier discovery.
            </p>
            <CategoryChipInput
              fields={categories}
              selectedFields={selectedCategories}
              setSelectedFields={setSelectedCategories}
            />
          </div>

          {/* Display Selected Categories */}
          {selectedCategories.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Categories
              </h3>
              <ul className="flex flex-wrap gap-2 mt-2">
                {selectedCategories.map((category) => (
                  <li
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    key={category}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="ghost"
              className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => createThread()}
              disabled={
                input.length === 0 ||
                selectedCategories.length < 1 ||
                isPending ||
                !user.customData.userID
              }
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition disabled:opacity-50"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Discussion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
