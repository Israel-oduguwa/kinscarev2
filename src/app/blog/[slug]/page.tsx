// app/blog/[slug]/page.tsx
import React from "react";
import Head from "next/head";
import PostHeader from "@/Blog/PostHeader";
import PostBody from "@/Blog/PostBody";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// API Utility Functions

async function getAllPosts(): Promise<string[]> {
  try {
    const res = await fetch("https://api.kinscare.org/api/v1/blogs/get-blog-slugs");
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
    const res = await fetch(`https://api.kinscare.org/api/v1/blogs/blog/${slug}`);
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

// Page Component

export default async function Page({ params }: { params: { slug: string } }) {
  const response = await getPostBySlug(params.slug);
  if (!response) {
    return notFound();
  }

  const { blog, similarBlogs } = response;
  const canonicalUrl = `https://kinscare.org/blog/${blog.slug}`;

  // Prepare structured data for rich results (JSON‑LD).
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
        url: "https://kinscare.org/logo.png",
      },
    },
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    url: canonicalUrl,
  };

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.featuredImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.excerpt} />
        <meta name="twitter:image" content={blog.featuredImage} />

        {/* JSON‑LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <main>
        <article>
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

// generateMetadata for Next.js SSG/SSR

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const postResponse = await getPostBySlug(params.slug);
  if (!postResponse) return notFound();
  const blog = postResponse.blog;
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

// generateStaticParams for SSG

export async function generateStaticParams() {
  const slugs = await getAllPosts();
  return slugs.map((slug: string) => ({ slug }));
}
