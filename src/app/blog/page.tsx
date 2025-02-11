import React from "react";
import { Metadata } from "next";
import BlogList from "@/Blog/BlogList";
import FeaturedArticle from "@/Blog/FeaturedArticle";

const API_URL = "https://api.kinscare.org/api/v1/blogs/all";

// **Generate SEO Metadata**
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Latest Blogs | My Blog",
    description: "Discover the latest blog posts and featured articles.",
    openGraph: {
      title: "Latest Blogs",
      description: "Read trending articles on our blog.",
      url: "https://yourwebsite.com/blogs",
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
      `https://api.kinscare.org/api/v1/blogs/featured-article/678ffa867c610b33e22985de`,
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
    <div>
      {/* Featured Article */}
      <header className="w-full py-20">
        <FeaturedArticle article={featuredArticle} />
      </header>

      {/* Client Component for Blogs (with Load More) */}
      <section className="bg-gray-100">
        <div className="max-w-screen-xl  py-10  mx-auto px-6">
          <BlogList initialBlogs={blogs} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
