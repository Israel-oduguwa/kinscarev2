"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { CreateThreadPayload } from "@/lib/validators/discussionSchema";
import { useContext } from "react";
import MongoContext from "@/app/MongoContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useCustomToast } from "@/app/hooks/use-custom-toast";
import Editor from "@/components/Editor";
import ImageUpload from "@/components/ImageUpload";
import ForumNavbar from "@/Forum/Navbar/ForumNavbar";
import CategoryChipInput from "@/components/ui/CategoryChipInput";
import ForumDynamicNavbar from "@/Forum/Navbar/ForumDynamicNavbar";
// title, content, userId, categories, tags

const categories = ["Programs", "RN program", "LPN program", "Physician Assistant", "Nurse",  "Schools", "Jobs", "Questions"]; // Pre-existing categories

const Page = () => {
  const [input, setInput] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const mongodb = useContext(MongoContext);
  const { user, userData }: any = mongodb;
  const router = useRouter();
  const { loginToast }: any = useCustomToast();
  const { mutate: createThread, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateThreadPayload = {
        title: input,
        userID: user.customData.userID,
        categories: selectedCategories,
        imageUrl,
        content: content,
        tags: [],
      };
      // console.log("jo");
      const { data } = await axios.post(
        `https://api.kinscare.org/api/v1/forum/threads`,
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
      // use the data.threadId
      //   We can run any function to track the users on segment or GTM
      const newPathname = `/community/discussions/${data.threadId}`;
      toast({
        title: "Discussion created successfully",
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

  return (
    <>
     
      <div className="mt-10 flex items-center h-full max-w-4xl mx-auto">
        <div className="relative py-0 bg-white w-full h-fit p-4 rounded-lg space-y-6">
          <div className="flex justify-between items-center ">
            <h1 className="text-xl font-bold text-gray-800">
              Start a New discussion
            </h1>
          </div>
          <hr className="bg-zinc-500 h-px" />
          <div className="mb-4 flex xs:flex-wrap items-center gap-2">
            <div className="p-3 rounded bg-gray-100">🗣️</div>
            <div className="w-full">
              <h2 className="text-md font-bold antialiased">Community</h2>
              <p className="text-sm antialiased">
                With Kinscare Community, providers and caregivers can create
                and participate in conversations directly within the platform.
                Discussions enable you to connect with the community to achieve
                the following goals: Share advice, insights, and experiences to
                foster growth and understanding. Ask and answer questions to
                build trust and collaboration within the network. Collaborate
                with others in a centralized, easy-to-access space designed for
                meaningful interactions. Discussions empower both providers and
                caregivers to build connections, share knowledge, and create a
                stronger, more supportive community without the need for
                third-party tools.
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
              <h2 className="mb-1 text-sm font-medium">Select Categories</h2>
              <p className="mb-3 text-sm antialiased">
                Category helps you to group your post for users to see them easy
              </p>
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
            {/* <ImageUpload
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              imageUrl={imageUrl}
            /> */}
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
              disabled={
                input.length === 0 ||
                selectedCategories.length < 1 ||
                isPending ||
                !user.customData.userID
              }
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Discussion
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Page;
