import React from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SimilarThreadToBlog from "./SimilarThreadToBlog";;
import { Briefcase, Users } from "lucide-react";

const CTASection = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Find Caregivers CTA */}
        <div className="relative p-8 bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-3xl shadow-[0_22px_60px_-40px_rgba(15,23,42,0.6)] hover:shadow-[0_28px_70px_-40px_rgba(15,23,42,0.7)] transition duration-300 transform hover:scale-[1.02]">
          <div className="absolute inset-0 opacity-10 bg-[url('/patterns/dots.svg')]"></div>
          <div className="relative flex flex-col items-start">
            <Users size={40} className="mb-4 text-white" />
            <h2 className="text-2xl font-[family:var(--header-font)] font-extrabold tracking-tight mb-2">
              Need a Caregiver?
            </h2>
            <p className="text-sm opacity-80">
              Find top-rated caregivers tailored to your needs. Trusted by thousands.
            </p>
            <Link
              href="/find-caregivers"
              className="mt-4 inline-block bg-white text-blue-700 font-semibold px-5 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Find a Caregiver
            </Link>
          </div>
        </div>

        {/* Find Jobs CTA */}
        <div className="relative p-8 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-3xl shadow-[0_22px_60px_-40px_rgba(15,23,42,0.6)] hover:shadow-[0_28px_70px_-40px_rgba(15,23,42,0.7)] transition duration-300 transform hover:scale-[1.02]">
          <div className="absolute inset-0 opacity-10 bg-[url('/patterns/dots.svg')]"></div>
          <div className="relative flex flex-col items-start">
            <Briefcase size={40} className="mb-4 text-white" />
            <h2 className="text-2xl font-[family:var(--header-font)] font-extrabold tracking-tight mb-2">
              Looking for a Job?
            </h2>
            <p className="text-sm opacity-80">
              Find your perfect caregiver job today. Get matched instantly.
            </p>
            <Link
              href="/find-jobs"
              className="mt-4 inline-block bg-white text-slate-700 font-semibold px-5 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Find Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};



function PostBody({
  content,
  toc,
  similarBlogs,
  blogSlug,
}: {
  content: string;
  toc: any[];
  similarBlogs: any[];
  blogSlug: string;
}) {
  // Process TOC into nested structure.
  // Only include items that have a non-empty id.
  const processToc = (items: any[]) => {
    // Filter out items without an id.
    const validItems = items.filter((item) => item.id && item.id.trim() !== "");
    const nestedToc = [];
    let currentParent: any = null;
    for (const item of validItems) {
      if (item.level === 2 || item.level === 3) {
        // Start a new parent item.
        currentParent = { ...item, children: [] };
        nestedToc.push(currentParent);
      } else if (item.level === 3 && currentParent) {
        currentParent.children.push(item);
      }
    }
    return nestedToc;
  };

  const nestedToc = processToc(toc);

  return (
    <>
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 px-4 md:px-8 py-16 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="relative">
          <div
            className="prose text-slate-700 max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-a:text-blue-600 hover:prose-a:text-blue-500
            prose-img:rounded-2xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Discuss on Forum Widget */}
          <div className="mt-12 p-6 bg-white/80 rounded-3xl shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] border border-white/70 backdrop-blur">
            <h3 className="text-2xl font-[family:var(--header-font)] font-extrabold text-slate-900 mb-4">
              Discuss this topic on our forum
            </h3>
            <p className="text-slate-600 mb-6">
              Have questions or want to share your story? Join the conversation
              and share your thoughts with the community.
            </p>
            <Link
              href="/community/create"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Start a Discussion
            </Link>
          </div>

          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-slate-400/10 rounded-full blur-3xl opacity-30 -z-10" />
        </div>

        {/* Sticky Right Column: Table of Contents and Forum Threads */}
        {(nestedToc.length > 0 || blogSlug) && (
          <div className="hidden lg:block space-y-8">
            {/* Table of Contents */}
            {nestedToc.length > 0 && (
              <div className="sticky top-32">
                <div className=" max-h-[400px] overflow-y-auto">
                  <nav
                    aria-label="Table of contents"
                    className="border-l-2 border-white/70 pl-5 space-y-2 bg-white/70 rounded-2xl p-4 shadow-sm backdrop-blur"
                  >
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      Table of Contents
                    </h3>
                    {nestedToc.map((item, index) => (
                      <details
                        key={item.id}
                        className="group marker:hidden"
                        open // Set to open by default; remove if you want them to collapse initially
                      >
                        <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer">
                          <div className="flex items-center justify-between gap-2 px-3 py-2 -ml-px rounded-lg hover:bg-slate-50 transition-colors">
                            <Link
                              href={`#${item.id}`}
                              className="text-sm font-medium text-slate-700"
                            >
                              {index+1 }. {"  "} {item.text}
                            </Link>
                            {item.children && item.children.length > 0 && (
                              <ChevronDown className="h-4 w-4 text-slate-400 transform transition-transform group-open:rotate-180" />
                            )}
                          </div>
                        </summary>
                        {item.children && item.children.length > 0 && (
                          <div className="ml-4 pl-3 border-l-2 border-white/70 space-y-2">
                            {item.children.map((child: any) => (
                              <Link
                                key={child.id}
                                href={`#${child.id}`}
                                className={clsx(
                                  "block px-3 py-1.5 -ml-px rounded-lg",
                                  "text-sm text-slate-500 hover:text-slate-700",
                                  "hover:bg-slate-50",
                                  "transition-colors duration-200"
                                )}
                              >
                                {child.text}
                              </Link>
                            ))}
                          </div>
                        )}
                      </details>
                    ))}
                  </nav>

                </div>
                {blogSlug && (
                    <div className="mt-8">
                      <SimilarThreadToBlog slug={blogSlug} />
                    </div>
                  )}
              </div>
            )}
            {/* Similar Forum Threads Component */}
          </div>
        )}
      </div>

      {/* Related Articles Section */}
      <div className="max-w-screen-xl mx-auto py-20">
        <h3 className="text-4xl font-[family:var(--header-font)] font-extrabold mb-10 text-slate-900 text-center">
          Related Articles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarBlogs.map((blog: any) => (
            <article
              key={blog._id}
              className="group relative bg-white/80 rounded-3xl shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-white/70 backdrop-blur"
            >
              <Link
                href={`/blog/${blog.slug}`}
                className="h-full flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-video overflow-hidden flex-shrink-0">
                  <Image
                    src={blog.featuredImage}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/40" />
                </div>

                {/* Content Container - Fixed Height */}
                <div className="p-6 flex flex-col flex-grow h-full space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-slate-600 line-clamp-3 leading-relaxed flex-grow">
                    {blog.excerpt}
                  </p>

                  {/* Author Section - Always at Bottom */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/70">
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-slate-400 blur opacity-20 group-hover:opacity-30 transition-opacity" />
                      <Image
                        src={blog.author.profilePicture}
                        alt={blog.author.name}
                        width={48}
                        height={48}
                        className="relative rounded-full border-2 border-white"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {blog.author.name}
                      </p>
                      <time className="text-sm text-slate-500">
                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    <div className="bg-white/60 py-10">
            {/* CTA Button  */}
            <CTASection/>
    </div>
    </>
  );
}

export default PostBody;
