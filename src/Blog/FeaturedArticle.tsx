import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface FeaturedArticleProps {
  article: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string;
  } | null;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  if (!article)
    return (
      <p className="text-slate-500 text-center py-12">
        No featured article available.
      </p>
    );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* Text Content */}
        <div className="space-y-6 order-2 md:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white/70 shadow-sm backdrop-blur">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="text-sm font-medium text-blue-600">
              Kinscare Blog
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-[family:var(--header-font)] font-extrabold text-slate-900 tracking-tight">
            {article.title}
          </h2>

          <Link href={`/blog/${article.slug}`} className="inline-block group">
            <Button
              variant="link"
              className="p-0 h-auto text-slate-900 group-hover:text-blue-600 transition-colors"
            >
              <span className="text-lg font-semibold">Read full article</span>
              <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Image Container */}
        <div className="relative order-1 md:order-2 group">
          <div className="relative w-full h-64 md:h-[400px] overflow-hidden rounded-3xl border border-white/70 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.6)]">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/20" />
          </div>
          
          {/* Decorative Element */}
          <div className="absolute -right-4 -top-4 -z-10 h-50 w-50 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;
