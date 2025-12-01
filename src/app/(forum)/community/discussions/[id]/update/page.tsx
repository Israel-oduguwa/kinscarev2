"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { CreateThreadPayload } from "@/lib/validators/discussionSchema";
import { useContext } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import Editor from "@/components/Editor";
import ImageUpload from "@/components/ImageUpload";
import ForumNavbar from "@/Forum/Navbar/ForumNavbar";
import CategoryChipInput from "@/components/ui/CategoryChipInput";
import ForumDynamicNavbar from "@/Forum/Navbar/ForumDynamicNavbar";
import { useApiClient } from "@/hooks/useApiClient";

const categories = [
  "Questions",
  "Actions",
  "Helps",
  "Updates",
  "News",
  "Provider Jobs",
];

const Page = (props: { params: Promise<{ id: string }> }) => {
  const params = use(props.params);
  const { id } = params;
  const [input, setInput] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discussionData, setDiscussionData] = useState("");
  const [loading, setLoading] = useState(true);
  const authData = useAuthContext()
  const { contactData }: any = authData
  const router = useRouter();
  const {privateApi} = useApiClient();
  const { loginToast }: any = useCustomToast();

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        const response = await privateApi.get(`/api/v1/forum/threads/${id}`
        );
        const { thread }: any = response.data;
        // console.log(thread);
        setDiscussionData(thread);
        setContent(thread.content);
        setSelectedCategories(thread.categories);
        setImageUrl(thread.imageUrl);
        setInput(thread.title);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchThread();
  }, [contactData]);

  const { mutate: createThread, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateThreadPayload = {
        title: input,
        userID: contactData.userID,
        categories: selectedCategories,
        imageUrl,
        content: content,
        tags: [],
      };
      // console.log("jo");
      const { data } = await axios.put(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/forum/threads/${id}`,
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
        description: "could not create discussion",
        variant: "destructive",
      });
    },
    onSuccess: (data: any) => {
      const newPathname = `/community/discussions/${id}`;
      toast({
        title: "Discussion updated successfully",
        description: "...",
        variant: "default",
      });
      router.push(newPathname);
    },
  });

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const handleImageRemove = (url: string) => {
    setImageUrl("");
  };

  const SkeletonLoader = () => (
    <div className="mt-14 flex items-center h-full max-w-4xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <hr className="bg-zinc-500 h-px" />

        {/* Discussion Info Skeleton */}
        <div className="mb-4 flex xs:flex-wrap items-center gap-2">
          <div className="p-3 rounded bg-gray-100 w-12 h-12 animate-pulse"></div>
          <div className="w-full space-y-2">
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Form Skeleton */}
        <div>
          {/* Title Input Skeleton */}
          <div className="mb-3">
            <div className="h-4 w-1/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Content Editor Skeleton */}
          <div>
            <div className="h-4 w-1/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Categories Skeleton */}
          <div className="py-3">
            <div className="h-4 w-1/4 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-4">
              <div className="h-4 w-1/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Skeleton */}
        <div>
          <div className="h-4 w-1/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex justify-end gap-4">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="mt-14 flex items-center h-full max-w-4xl mx-auto">
          <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
            <div className="flex justify-between items-center ">
              <h1 className="text-xl font-bold text-gray-800">
                Update your discussion
              </h1>
            </div>
            <hr className="bg-zinc-500 h-px" />
            <div className="mb-4 flex xs:flex-wrap items-center gap-2">
              <div className="p-3 rounded bg-gray-100">🗣️</div>
              <div className="w-full">
                <h2 className="text-md font-bold antialiased">Discussions</h2>
                <p className="text-sm antialiased">
                  Conversations solely for GitHub Discussions-related
                  conversations. With GitHub Discussions, the community for your
                  project can create and participate in conversations within the
                  project's repository or organization. Discussions empower a
                  project's maintainers, contributors, and visitors to gather
                  and accomplish the following goals in a central location,
                  without third-party tools. Please use 'General' for other misc
                  topic
                </p>
              </div>
            </div>
            {/* form  */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Discussion title
                </p>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pl-6"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Content body
                </p>
                <Editor
                  onChange={setContent}
                  initialContent={content}
                  usage={""}
                />
              </div>
              <div className="py-3">
                <h2 className="mb-3 text-sm font-medium">Select Categories</h2>
                {/* Use the reusable ChipInput component */}
                <CategoryChipInput
                  fields={categories}
                  selectedFields={selectedCategories}
                  setSelectedFields={setSelectedCategories}
                />

                {/* Display selected categories */}
                <div className="mt-4">
                  <h3 className="font-medium text-sm">Selected Categories</h3>
                  <ul className="list-disc list-inside">
                    {selectedCategories.map((category) => (
                      <li className="text-sm text-gray-600" key={category}>
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                imageUrl={imageUrl}
              />
              {imageUrl && (
                <div className="mt-4">
                  <p>Uploaded Image URL:</p>
                  <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                    {imageUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => createThread()}
                disabled={input.length === 0 || isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Discussion
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Page;