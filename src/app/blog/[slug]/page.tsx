// app/blog/[slug]/page.tsx
import React from "react";
import PostHeader from "@/Blog/PostHeader";
import PostBody from "@/Blog/PostBody";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// ---------- API Utility Functions ----------

async function getAllPosts(): Promise<string[]> {
  try {
    const res = await fetch(
      "http://https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/blogs/get-blog-slugs",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch blog slugs");
    }

    const data = await res.json();
    // Assume data is an array of slugs (strings)
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getPostBySlug(slug: string) {
  try {
    // console.log(slug, "this is slug");
    const res = await fetch(
      `http://https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/blogs/blog/${slug}`,
      {
        cache: "no-store",
      }
    );
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

// ---------- Page Component ----------

// NOTE: params is now a Promise<{ slug: string }>
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ unwrap the Promise
  // console.log(slug, "checking params");

  const response = await getPostBySlug(slug);
  if (!response) {
    return notFound();
  }

  const { blog, similarBlogs } = response;
  const canonicalUrl = `https://kinscare.org/blog/${blog.slug}`;

  // Prepare structured data for rich results (JSON-LD).
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: [blog.featuredImage],
    author: {
      "@type": "Person",
      name: blog.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Your Blog Name",
      logo: {
        "@type": "ImageObject",
        url: "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444",
      },
    },
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    url: canonicalUrl,
  };

  return (
    <>
      <main>
        <article>
          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />

          <PostHeader
            title={blog.title}
            slug={blog.slug}
            coverImage={blog.featuredImage}
            date={blog.updatedAt}
            author={blog.author}
          />
          <PostBody
            content={blog.htmlContent}
            similarBlogs={similarBlogs}
            toc={blog.toc}
            blogSlug={blog.slug}
          />
        </article>
      </main>
    </>
  );
}

// ---------- generateMetadata for Next.js SSG/SSR ----------

// NOTE: params is also a Promise here in Next 15/16
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // ✅ unwrap here as well

  const postResponse = await getPostBySlug(slug);
  // console.log(postResponse, "response");

  if (!postResponse) {
    // generateMetadata can't call notFound(), so return fallback metadata
    return {
      title: "Post not found | KinsCare",
      description: "The requested blog post could not be found.",
    };
  }

  const { blog } = postResponse;
  const canonicalUrl = `https://kinscare.org/blog/${blog.slug}`;

  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: [blog.featuredImage],
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [blog.featuredImage],
    },
  };
}

// ---------- generateStaticParams for SSG ----------

export async function generateStaticParams() {
  const slugs = await getAllPosts();
  return slugs.map((slug: string) => ({ slug }));
}
