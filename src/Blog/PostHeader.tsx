import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import ShareSocial from "./ShareSocial";
import { formatDistanceToNow } from "date-fns";

interface ArticleHeaderProps {
  title: string;
  author: { name: string; profilePicture?: string };
  date: string;
  coverImage?: string;
  slug: string;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  title,
  author,
  date,
  slug,
  coverImage,
}) => {
  const currentURL = typeof window !== "undefined" ? window.location.href : "";

  return (
    <header className="relative isolate overflow-hidden  bg-blue-50 py-10 dark:from-gray-900/95 dark:to-gray-900">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-15 dark:opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.22'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Breadcrumb with glassmorphism effect */}
        <Breadcrumb className="mb-8">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/blog"
                className="group inline-flex items-center rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-white hover:shadow-sm dark:bg-gray-800/70 dark:text-gray-300 dark:hover:bg-gray-800/90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Blog
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Content Grid */}
        <div className="grid auto-rows-min grid-cols-1 gap-y-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-0">
          {/* Text Content */}
          <div className="max-w-3xl space-y-8">
            <h1 className="text-4xl font-semibold tracking-tight leading-9 text-gray-700 dark:text-gray-100 sm:text-4xl lg:text-6xl">
              {title}
            </h1>

            {/* Author Section */}
            <div className="flex items-center gap-1.5">
              <Avatar className="h-12 w-12 transition-transform hover:scale-105">
                {author.profilePicture ? (
                  <AvatarImage
                    src={author.profilePicture}
                    alt={author.name}
                    className="ring-3 ring-blue-500/20 dark:ring-blue-400/30"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 font-medium text-white">
                    {author.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="">
                <p className=" text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {author.name}
                </p>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(date), {
                    addSuffix: true,
                  })}
                </time>
              </div>
            </div>
            {/* social share  */}
            <div>
              <ShareSocial title={title} slug={slug} />
            </div>
          </div>

          {/* Cover Image */}
          {coverImage && (
            <div className="relative aspect-[5/3] w-full overflow-hidden rounded-3xl shadow-2xl lg:-translate-y-12 lg:scale-110">
              <img
                src={coverImage}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/30 dark:to-gray-900/50" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ArticleHeader;
