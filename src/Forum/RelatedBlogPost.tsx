"use client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Article {
  slug: string;
  title: string;
  featuredImage: string;
}

function RelatedBlogPost({ threadID }: { threadID: string }) {
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // Fetch Similar Articles
  const getSimilarArticles = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`"https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/blogs/get-article-similar-to-thread/${threadID}`
      );
      setSimilarArticles(data.similarArticles || []);
    } catch (error) {
      console.error("Error fetching related articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSimilarArticles();
  }, [threadID]);

  return (
    <div className="shadow-sm bg-white rounded-xl p-6 mb-10 ">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Check out these articles
      </h4>

      {loading ? (
        // Loading Skeleton UI
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex gap-3 items-center">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : similarArticles.length > 0 ? (
        // Render Similar Articles
        <div className="space-y-4">
          {similarArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="block"
            >
              <div className="flex gap-4 items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                {/* Article Image */}
                <img
                  src={article.featuredImage}
                  className="w-14 h-14 object-cover rounded-lg shadow-md"
                  alt={article.title}
                />
                {/* Article Details */}
                <h4 className="text-sm font-medium text-gray-800 dark:text-white leading-tight">
                  {article.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No related articles found.
        </p>
      )}
    </div>
  );
}

export default RelatedBlogPost;
