// app/blog/[slug]/page.tsx
import React from "react";
import PostBody from "@/Blog/PostBody";
import PostHeader from "@/Blog/PostHeader";
import markdownToHtml from "@/lib/markdownToHtml";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// The page component receives { params } which includes the slug.
export default async function Page({ params }: { params: { slug: string } }) {
  const response = await getPostBySlug(params.slug);
  if (!response) {
    return notFound();
  }

  const {blog, similarBlogs} = response;
  // Convert the markdown (or any raw HTML stored) to HTML.
  // Adjust markdownToHtml if you need to process Markdown.
  // const content = await markdownToHtml(post.htmlContent  || "");
  // console.log(content);
  return (
    <main>
      <article className="">
        <PostHeader
          title={blog.title}
          slug={blog.slug}
          coverImage={blog.featuredImage}
          date={blog.updatedAt}
          author={blog.author}
        />
        <PostBody content={blog.htmlContent} similarBlogs={similarBlogs} toc={blog.toc} blogSlug={blog.slug} />
      </article>
    </main>
  );
}

// Generate metadata for the page.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return notFound();
  }
  const title = post.title;
  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage?.url || ""],
    },
  };
}

// Generate static parameters for SSG.
export async function generateStaticParams() {
  const slugs = await getAllPosts();
  // console.log(slugs, "s");
  // Assuming getAllPosts returns an array of slugs (strings).
  return slugs.map((slug: string) => ({ slug }));
}

/* -----------------------------------------------------------------
   API Utility Functions
   These functions call your backend API endpoints.
------------------------------------------------------------------*/

/**
 * Fetches all blog slugs.
 * Adjust the data mapping if your API returns objects instead of strings.
 */
async function getAllPosts(): Promise<string[]> {
  try {
    const res = await fetch(
      "https://api.kinscare.org/api/v1/blogs/get-blog-slugs"
    );
    if (!res.ok) {
      throw new Error("Failed to fetch blog slugs");
    }
    const data = await res.json();
    // console.log(data)
    // If your API returns an array of objects, e.g. [{ slug: 'post-1' }, { slug: 'post-2' }],
    // then use: return data.map((post: any) => post.slug);
    return data; // Assuming data is an array of strings.
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Fetches a single blog post by its slug.
 */
async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(`https://api.kinscare.org/api/v1/blogs/blog/${slug}`);
    // console.log(res);
    if (!res.ok) {
      throw new Error("Failed to fetch post");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
