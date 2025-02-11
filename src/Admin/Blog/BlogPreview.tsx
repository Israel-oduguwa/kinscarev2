"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Blocks from "editorjs-blocks-react-renderer";
import { Edit, Loader as LoaderIcon } from "lucide-react";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useParams } from "next/navigation";
import MongoContext from "@/app/MongoContext";
import { convertEditorJsToHtml } from "./editorJsToHtml";

const BASEURL = "https://api.kinscare.org";

// ------------------------
// Custom Block Parsers
// ------------------------

// Header parser now always renders the header element.
// If data.anchor exists, it's applied as the id.
const HeaderIDParser = ({ data }: { data: any }) => {
  const Tag = `h${data.level}`;
  return (
    <Tag id={data.anchor ? data.anchor : undefined} className="mt-4 font-bold">
      {data.text}
    </Tag>
  );
};

// Image parser now checks that data.url exists and applies a border if withBorder is true.
const ImageBlockParser = ({ data }: { data: any }) => {
  if (data && data.url) {
    const imageBorder = data.withBorder ? "border border-gray-300" : "";
    return (
      <figure className="mb-5">
        <img
          src={data.url}
          alt={data.caption || "Image"}
          className={`w-full rounded ${imageBorder}`}
        />
        {data.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2">
            {data.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return null;
};

// Custom layout parser – ensure the inner content is available before mapping.
const CustomLayoutParser = ({ data }: { data: any }) => {
  if (
    data &&
    data.itemContent &&
    data.itemContent["1"] &&
    data.itemContent["1"].blocks
  ) {
    const innerBlocks = data.itemContent["1"].blocks.map(
      (innerBlock: any, index: number) => {
        switch (innerBlock.type) {
          case "header": {
            const HeaderTag = `h${innerBlock.data.level}`;
            return (
              <HeaderTag
                key={index}
                id={innerBlock.data.anchor ? innerBlock.data.anchor : undefined}
                className="mt-4 font-bold"
              >
                {innerBlock.data.text}
              </HeaderTag>
            );
          }
          case "list": {
            const listItems = innerBlock.data.items.map(
              (item: string, i: number) => (
                <li key={i} className="ml-4 list-disc">
                  {item}
                </li>
              )
            );
            return innerBlock.data.style === "ordered" ? (
              <ol key={index} className="mt-2">
                {listItems}
              </ol>
            ) : (
              <ul key={index} className="mt-2">
                {listItems}
              </ul>
            );
          }
          case "checklist": {
            return (
              <div key={index} className="mt-2 space-y-1">
                {innerBlock.data.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      disabled
                      className="mr-2"
                    />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            );
          }
          case "paragraph": {
            return (
              <p key={index} className="mt-2">
                {innerBlock.data.text}
              </p>
            );
          }
          case "image": {
            const border = innerBlock.data.withBorder
              ? "border border-gray-300"
              : "";
            return (
              <figure key={index} className="mb-5">
                <img
                  src={innerBlock.data.url}
                  alt={innerBlock.data.caption || "Image"}
                  className={`w-full rounded ${border}`}
                />
                {innerBlock.data.caption && (
                  <figcaption className="text-center text-sm text-gray-500 mt-2">
                    {innerBlock.data.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          default:
            return null;
        }
      }
    );
    return <div className="bg-gray-50 rounded p-6 my-10">{innerBlocks}</div>;
  }
  return null;
};

// ------------------------
// BlogPreview Component
// ------------------------
function BlogPreview() {
  // State variables for blog data
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [series, setSeries] = useState("Resume Tutorial");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tags, setTags] = useState<any[]>([]);
  const [content, setContent] = useState<any>(null);
  const [seriesSlug, setSeriesSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeHeader, setActiveHeader] = useState<string | null>(null);
  const [author, setAuthor] = useState({ name: "", image: "" });
  const [htmlContent, setHtmlContent] = useState("");
  const [toc, setToc] = useState([]);
  const { userData }: any = useContext(MongoContext);
  const { id } = useParams();
  const userID = userData?.userID;

  // Fetch post data from the API
  const fetchPost = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/api/v1/blogs/get_user_article/${id}`,
        { params: { userID } }
      );
      const postData = response.data;
      setTitle(postData.title);
      setHtmlContent(response.htmlContent);
      setSlug(postData.slug);
      setExcerpt(postData.excerpt);
      setFeaturedImage(postData.featuredImage);
      setSeries(postData.series);
      setMetaTitle(postData.metaTitle);
      setMetaDescription(postData.metaDescription);
      setToc(postData.toc);

      // Ensure content is parsed correctly
      const contentData =
        typeof postData.content === "string"
          ? JSON.parse(postData.content)
          : postData.content;
      setContent(contentData);

      setTags(postData.tags);
      setSeriesSlug(postData.seriesSlug);
      setAuthor(postData.author);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching post:", error);
      setLoading(false);
    }
  };

  // Extract header blocks (even if no anchor is present) for the Table of Contents.
  // (If you wish to include only those with anchors, filter accordingly.)
  const headerBlocks =
    content && content.blocks
      ? content.blocks.filter((block: any) => block.type === "header")
      : [];

  useEffect(() => {
    // Check for a draft in localStorage first
    const draft = localStorage.getItem(`draftContent_${id}`);
    if (draft) {
      const response = JSON.parse(draft);
      setTitle(response.title);
      setFeaturedImage(response.featuredImage);
      setToc(response.toc);
      setAuthor(response.author);
      setContent(response.content);
      setHtmlContent(response.htmlContent);
      setLoading(false);
    } else {
      fetchPost();
    }
    // Optionally set the active header to the first header block.
    if (toc.length > 0) {
      setActiveHeader(toc.anchor && toc[0].anchor || headerBlocks[0].text);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderIcon className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    );
  }

  // Scroll to the header element when a TOC item is clicked
  const handleHeaderClick = (headerId: string) => {
    setActiveHeader(headerId);
    const headerElement = document.getElementById(headerId);
    if (headerElement) {
      headerElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-[1260px] mx-auto mt-8 px-4">
      {/* Post Header Section */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {featuredImage && (
            <div>
              <img
                src={featuredImage}
                alt={title}
                className="rounded-lg shadow-lg w-full h-80 object-cover"
              />
            </div>
          )}
          <div>
            <div className="mb-4">
              <span className="text-sm font-semibold uppercase text-secondary">
                {series}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="w-10 h-10">
                {author.image ? (
                  <AvatarImage src={author.image} alt={author.name} />
                ) : (
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm font-semibold">By {author.name}</span>
            </div>
            <Button asChild variant="link">
              <Link
                href={`/admin/blog/edit/${id}`}
                className="flex items-center text-blue-600 hover:underline font-semibold"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Article
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content and Table of Contents */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Article Content */}
        <div className="md:col-span-9">
          <section className="prose max-w-none">
            {/* Use a dynamic key to force re-render when content changes */}
            {/* <Blocks
              key={JSON.stringify(content)}
              data={content}
              renderers={{
                header: HeaderIDParser,
                layout: CustomLayoutParser,
                image: ImageBlockParser,
              }}
            /> */}

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </section>
        </div>

        {/* Table of Contents Sidebar */}
        <div className="md:col-span-3">
          <div className="sticky top-8">
            <h2 className="text-sm font-semibold mb-4">TABLE OF CONTENT</h2>
            <div className="space-y-2">
              {toc.map((block: any) => {
                // Use anchor if available; otherwise, fallback to text.
                const headerId = block.anchor && block.anchor || block.text;
                return (
                  <div
                    key={headerId}
                    className={`cursor-pointer p-3 rounded transition ${
                      headerId === activeHeader
                        ? "bg-white shadow-lg font-semibold"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleHeaderClick(headerId)}
                  >
                    {block.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogPreview;
