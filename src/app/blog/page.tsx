import React from "react";
import { Metadata } from "next";
import BlogList from "@/Blog/BlogList";
import FeaturedArticle from "@/Blog/FeaturedArticle";

const API_URL = "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/blogs/all";

// **Generate SEO Metadata**
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Latest Blogs | My Blog",
    description: "Discover the latest blog posts and featured articles.",
    openGraph: {
      title: "Latest Blogs",
      description: "Read trending articles on our blog.",
      url: "https://kinscare.org/blogs",
      type: "website",
    },
  };
}

// **Fetch Initial Blogs (SSG)**
async function fetchInitialBlogs() {
  try {
    const res = await fetch(`${API_URL}?sortBy=recent&page=1&limit=10`, {
      cache: "no-cache",
    });

    // if (!res.ok) throw new Error("Failed to fetch blogs");

    return res.json();
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { blogs: [], totalPages: 0 };
  }
}

// **Fetch Featured Article**
async function fetchFeaturedArticle() {
  try {
    const res = await fetch(
      `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/blogs/featured-article/68633e79e236b3979597f4a8`,
      { cache: "no-cache" }
    );

    // if (!res.ok) throw new Error("Failed to fetch featured article");

    return await res.json();
  } catch (error) {
    console.error("Error fetching featured article:", error);
    return null;
  }
}

export default async function Page() {
  const initialBlog = await fetchInitialBlogs();
  const { blogs, totalPages } = initialBlog;
  const featuredArticle = await fetchFeaturedArticle();
  // console.log(featuredArticle);
  return (
    <div className="relative bg-slate-950/5 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_-10%,rgba(59,130,246,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_20%,rgba(30,64,175,0.12),transparent_60%)]" />
        <div className="absolute -top-24 right-6 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:36px_36px] opacity-30" />
      </div>
      {/* Featured Article */}
      <header className="relative w-full py-20">
        <FeaturedArticle article={featuredArticle} />
      </header>

      {/* Client Component for Blogs (with Load More) */}
      <section className="relative">
        <div className="max-w-screen-xl py-10 mx-auto px-6">
          <BlogList initialBlogs={blogs} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
