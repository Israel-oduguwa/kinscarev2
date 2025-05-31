"use client";

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useParams } from "next/navigation";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import BlogEditor from "./BlogEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

// --- Shadcn UI Dialog Components ---
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// --- A generic MultiSelect component using Shadcn UI ---
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { convertEditorJsToHtml } from "./editorJsToHtml";
import ImageUploader from "./ImageUploader";

interface Option {
  label: string;
  value?: string;
  slug?: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  getOptionValue?: (option: Option) => string;
  getOptionLabel?: (option: Option) => string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  getOptionValue = (option: Option) => option.label,
  getOptionLabel = (option: Option) => option.label,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (option: Option) => {
    const value = getOptionValue(option);
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-between flex-wrap"
        >
          {/* Wrap the selected text to handle long content */}
          <span className="flex-1 truncate">
            {selected.length > 0 ? selected.join(", ") : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      {/* Ensure the popover content is on top and receives pointer events.
          Optionally, if your library supports a Portal wrapper, consider wrapping this */}
      <PopoverContent className="w-full z-[9999] p-0 pointer-events-auto">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const value = getOptionValue(option);
                const label = getOptionLabel(option);
                const isSelected = selected.includes(value);
                return (
                  <CommandItem
                    key={value}
                    // Stop event propagation so the click does not hit underlying elements.
                    onSelect={(e) => {
                      // e.stopPropagation();
                      toggleOption(option);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- The main EditBlog component ---
interface Blog {
  _id: string;
  title: string;
  content: string;
  categories: string[] | { label: string; slug: string }[];
  tags: string[];
  isPublished: boolean;
}

const categoriesOptions = [
  { label: "Caregiver Hiring", slug: "caregiver-hiring" },
  { label: "Provider Insights", slug: "provider-insights" },
  { label: "Healthcare Career Growth", slug: "healthcare-career-growth" },
  { label: "Workforce Trends", slug: "workforce-trends" },
  { label: "Kinscare and Updates", slug: "kinscare-platform-updates" },
  { label: "Profession", slug: "profession" },
  { label: "Program", slug: "program" },
  { label: "State", slug: "state" },
  { label: "Healthcare", slug: "healthcare" },
  { label: "Medical", slug: "medical" },
  { label: "Wellness", slug: "wellness" },
  { label: "Patient Services", slug: "patient-services" },
  { label: "Insurance", slug: "insurance" },
];

// Tags for your blog posts
const tagsOptions = [
  { label: "Nursing", value: "nursing" },
  { label: "Allied Health", value: "allied-health" },
  { label: "Post-Bachelor", value: "post-bachelor" },
  { label: "Bachelor's", value: "bachelors" },
  { label: "Associates", value: "associates" },
  { label: "Diploma", value: "diploma" },
  { label: "Certificates", value: "certificates" },
  // Hiring & Workforce Tags
  { label: "Caregiver Hiring", value: "caregiver-hiring" },
  { label: "Direct Care Jobs", value: "direct-care-jobs" },
  { label: "Healthcare Staffing", value: "healthcare-staffing" },
  { label: "CNA Recruitment", value: "cna-recruitment" },
  { label: "Home Care Hiring", value: "home-care-hiring" },
  { label: "Long-Term Care Workforce", value: "long-term-care-workforce" },
  { label: "Hiring Tools for Providers", value: "hiring-tools-for-providers" },

  // Caregiving Tags
  { label: "Caregiving Jobs", value: "caregiving-jobs" },
  { label: "Caregiver Shift Types", value: "caregiver-shift-types" },
  { label: "HCA vs CNA", value: "hca-vs-cna" },
  { label: "Live-in Caregiver Roles", value: "live-in-caregiver-roles" },
  { label: "Part-Time Caregiver Jobs", value: "part-time-caregiver-jobs" },

  // Platform & KinsCare-Specific Tags
  { label: "KinsCare Platform", value: "kinscare-platform" },
  { label: "Caregiver Profiles", value: "caregiver-profiles" },
  { label: "Smart Caregiver Matching", value: "smart-caregiver-matching" },
  { label: "Provider Dashboard", value: "provider-dashboard" },
  { label: "Care Home Solutions", value: "care-home-solutions" },
];

export default function EditBlog() {
  const router = useRouter();
  const { id } = useParams();
  const { userData }: any = useContext(MongoContext);
  const BASEURL = "https://api.kinscare.org";

  // --- State variables for blog fields ---
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  // --- Additional state variables for revert functionality ---
  const [series, setSeries] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [seriesSlug, setSeriesSlug] = useState("");
  const [author, setAuthor] = useState("");

  // --- Loading states for button actions ---
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // --- State for controlling the publish dialog ---
  const [dialogOpen, setDialogOpen] = useState(false);

  /**
   * Convert a category (which might be a simple string) into an object
   * containing both a label and a slug.
   */
  const convertToLabelAndSlug = (
    category: string | { label: string; slug: string }
  ) => {
    if (
      typeof category === "object" &&
      "label" in category &&
      "slug" in category
    ) {
      return category;
    } else {
      return {
        label: category,
        slug: category.toLowerCase().replace(/\s+/g, "-"),
      };
    }
  };

  /**
   * Update the draft in localStorage with the current state values.
   */
  const updateLocalStorage = () => {
    const categoriesWithLabelAndSlug = categories.map((cat) =>
      convertToLabelAndSlug(cat)
    );
    const { html, toc } = convertEditorJsToHtml(content);
    // console.log(html, toc);
    const draftData = {
      title,
      slug,
      excerpt,
      featuredImage,
      content,
      categories: categoriesWithLabelAndSlug,
      toc: toc,
      htmlContent: html,
      tags,
      isPublished,
      series,
      metaTitle,
      metaDescription,
      seriesSlug,
      author,
    };
    localStorage.setItem(`draftContent_${id}`, JSON.stringify(draftData));
  };

  /**
   * On mount, try to load a saved draft from localStorage.
   * If none exists, fetch the blog data from the server.
   */
  useEffect(() => {
    if (!id) return;

    const storedDraft = localStorage.getItem(`draftContent_${id}`);
    if (storedDraft) {
      try {
        const postData = JSON.parse(storedDraft);
        setTitle(postData.title || "");
        setSlug(postData.slug || "");
        setExcerpt(postData.excerpt || "");
        setFeaturedImage(postData.featuredImage || "");
        if (postData.categories && postData.categories.length > 0) {
          if (typeof postData.categories[0] === "object") {
            setCategories(postData.categories.map((cat: any) => cat.label));
          } else {
            setCategories(postData.categories);
          }
        }
        setTags(postData.tags || []);
        setIsPublished(postData.isPublished || false);
        setContent(postData.content || "");
        setHtmlContent(htmlContent);
        setSeries(postData.series || "");
        setMetaTitle(postData.metaTitle || "");
        setMetaDescription(postData.metaDescription || "");
        setSeriesSlug(postData.seriesSlug || "");
        setAuthor(postData.author || "");
      } catch (error) {
        console.error("Error parsing draft data:", error);
      }
      setLoading(false);
    } else {
      fetchBlog();
    }
  }, [id]);

  /**
   * Fetch the blog data from the server.
   */
  const fetchBlog = async () => {
    if (!userData || !id) return;
    try {
      setLoading(true);
      const userID = userData.userID;
      const response = await axios.get(
        `${BASEURL}/api/v1/blogs/get_user_article/${id}`,
        { params: { userID } }
      );
      const postData = response.data;
      setTitle(postData.title || "");
      setSlug(postData.slug || "");
      setExcerpt(postData.excerpt || "");
      setFeaturedImage(postData.featuredImage || "");
      if (postData.categories && postData.categories.length > 0) {
        if (typeof postData.categories[0] === "object") {
          setCategories(postData.categories.map((cat: any) => cat.label));
        } else {
          setCategories(postData.categories);
        }
      }
      setTags(postData.tags || []);
      setIsPublished(postData.isPublished || false);
      setHtmlContent(postData.htmlContent);
      setContent(postData.content || "");
      setSeries(postData.series || "");
      setMetaTitle(postData.metaTitle || "");
      setMetaDescription(postData.metaDescription || "");
      setSeriesSlug(postData.seriesSlug || "");
      setAuthor(postData.author || "");
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to fetch blog data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Whenever any of our key fields change (and once data is loaded)
   * update the localStorage draft.
   */
  useEffect(() => {
    if (!loading && title) {
      updateLocalStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    slug,
    excerpt,
    featuredImage,
    content,
    categories,
    tags,
    isPublished,
    author,
  ]);

  /**
   * Automatically generate a slug from the title.
   */
  useEffect(() => {
    const generateSlug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    setSlug(generateSlug);
  }, [title]);

  /**
   * Submit the updated blog post.
   */
  const handleSubmit = async () => {
    setIsPublishing(true);
    const categoriesWithLabelAndSlug = categories.map((cat) =>
      convertToLabelAndSlug(cat)
    );

    const { html, toc } = convertEditorJsToHtml(content);
    console.log(html, toc);

    const postData = {
      title,
      slug,
      excerpt,
      toc: toc,
      htmlContent: html,
      featuredImage,
      isPublished: true,
      content,
      categories: categoriesWithLabelAndSlug,
      tags,
    };
    try {
      const response = await axios.put(
        `${BASEURL}/api/v1/blogs/update/${id}`,
        postData
      );
      if (response.status === 200) {
        localStorage.removeItem(`draftContent_${id}`);
        router.push("/admin/blog/all");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      setError("Failed to update the blog. Please try again later.");
    } finally {
      setIsPublishing(false);
      setDialogOpen(false);
    }
  };

  /**
   * Handle preview action.
   */
  const handlePreview = () => {
    setIsPreviewing(true);
    router.push(`/admin/blog/preview/${id}`);
  };

  /**
   * Revert to the published version from the server.
   */
  const handleRevertToPublished = async () => {
    setIsReverting(true);
    try {
      const response = await axios.get(`${BASEURL}/api/post/cms/${id}`);
      const postData = response.data;
      console.log(postData);
      const isCategoriesWithLabelAndSlug =
        postData.categories && typeof postData.categories[0] === "object";
      if (isCategoriesWithLabelAndSlug) {
        const categoriesAsStrings = postData.categories.map(
          (category: any) => category.label
        );
        setCategories(categoriesAsStrings);
      } else {
        setCategories(postData.categories);
      }
      setTitle(postData.title);
      setSlug(postData.slug);
      setExcerpt(postData.excerpt);
      setFeaturedImage(postData.featuredImage);
      setContent(postData.content);

      setTags(postData.tags);
      localStorage.removeItem(`draftContent_${id}`);
    } catch (error) {
      console.error("Error reverting to published version:", error);
    } finally {
      setIsReverting(false);
    }
  };

  if (loading) return <Skeleton className="h-12 w-full" />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Publish and Preview Buttons */}
      <header className="flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-10">
        <h1 className="font-bold text-gray-800">Edit Article</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isPreviewing}
          >
            {isPreviewing ? <Loader className="animate-spin" /> : "Preview"}
          </Button>
          <Button variant="default" onClick={() => setDialogOpen(true)}>
            Publish Article
          </Button>
        </div>
      </header>

      {/* Editor Section */}
      <main className="flex-1 p-4">
        <BlogEditor
          data={content}
          onChange={setContent}
          editorBlock="editorjs-container"
        />
      </main>

      {/* Publish Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl w-full p-6">
          <DialogHeader>
            <DialogTitle>Article Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
              />
            </div>
            {/* Slug */}
            <div>
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-article-slug"
              />
            </div>
            {/* Excerpt */}
            <div>
              <Label>Excerpt</Label>
              <Textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary of the article..."
              />
            </div>
            {/* Categories & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Categories</Label>
                <MultiSelect
                  options={categoriesOptions}
                  selected={categories}
                  onChange={setCategories}
                  placeholder="Select categories"
                  getOptionValue={(option) => option.label}
                  getOptionLabel={(option) => option.label}
                />
              </div>
              <div>
                <Label>Tags</Label>
                <MultiSelect
                  options={tagsOptions}
                  selected={tags}
                  onChange={setTags}
                  placeholder="Select tags"
                  getOptionValue={(option) =>
                    option.value ? option.value : option.label
                  }
                  getOptionLabel={(option) => option.label}
                />
              </div>
            </div>
            {/* Featured Image */}
            <div>
              <Label>Featured Image URL</Label>
              <ImageUploader
                value={featuredImage}
                onChange={(url) => setFeaturedImage(url)}
                onDelete={() => setFeaturedImage("")}
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleRevertToPublished}
              disabled={isReverting || isPreviewing || isPublished}
            >
              {isReverting ? (
                <Loader className="animate-spin" />
              ) : (
                "Revert to Published"
              )}
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={isReverting || isPreviewing }
            >
              {isPublishing ? (
                <Loader className="animate-spin" />
              ) : (
                "Publish Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
