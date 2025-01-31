// app/[id]/page.tsx
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Discussion from '@/Forum/Discussion';
import DiscussionPosts from '@/Forum/DiscussionPosts';
import LeftFilter from '@/Forum/UI/LeftFilter';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
// import { stripHtml, truncateHtml } from '@/lib/utils';
import truncate from 'truncate-html';
function DiscussionSkeleton() {
  return (
    <div className="rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-lg w-full">
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-4" /> {/* Title */}
        <div className="flex justify-between w-full mb-6">
          <div className="flex gap-3 items-center">
            <Skeleton className="w-12 h-12 rounded-full" /> {/* Avatar */}
            <div>
              <Skeleton className="h-4 w-32 mb-1" /> {/* Name */}
              <Skeleton className="h-3 w-20" /> {/* Date */}
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Menu Action */}
        </div>
        <Skeleton className="h-24 w-full mb-6" /> {/* Content */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-6 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
        <Skeleton className="h-10 w-24" /> {/* Like Component */}
      </div>
      <div className="p-3 border-t border-t-gray-100 bg-gray-50">
        <Skeleton className="h-6 w-20 mb-2" /> {/* Reply */}
        <Skeleton className="h-12 w-full" /> {/* Create Post Input */}
      </div>
    </div>
  );
}

 function DiscussionPostSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="w-full rounded-lg p-6 mb-6 shadow-sm bg-white dark:bg-slate-900"
        >
          <div className="flex w-full justify-between mb-4">
            <div className="flex gap-3 items-center">
              <Skeleton className="w-12 h-12 rounded-full" /> {/* Avatar */}
              <div>
                <Skeleton className="h-4 w-32 mb-1" /> {/* Name */}
                <Skeleton className="h-3 w-20" /> {/* Date */}
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Menu Action */}
          </div>
          <Skeleton className="h-16 w-full mb-4" /> {/* Post Content */}
          <div className="flex gap-2 items-center">
            <Skeleton className="h-8 w-16" /> {/* Like Component */}
            <Skeleton className="h-4 w-20" /> {/* Replies */}
          </div>
          <div className="mt-4">
            <Skeleton className="h-8 w-full" /> {/* Comment Input */}
          </div>
        </div>
      ))}
    </>
  );
}
// Metadata function
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;

  try {
    // Fetch thread and posts data
    const threadResponse = await fetch(`https://api.kinscare.org/api/v1/forum/threads/${id}`, { cache: 'no-cache' });
    const postsResponse = await fetch(`https://api.kinscare.org/api/v1/forum/threads/${id}/posts`, { cache: 'no-cache' });

    const threadData = await threadResponse.json();
    const thread = threadData.thread
 
    const { posts } = await postsResponse.json();
    // console.log("this is metadata thread", posts)
    if (!thread) {
      return {
        title: 'Thread Not Found',
        description: 'The thread you are looking for does not exist.',
      };
    }

    const sanitizedDescription = truncate(thread.content, {
      length:150,
      ellipsis:"..."
    })
    // Generate JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'DiscussionForumPosting',
      headline: thread.title,
      description: sanitizedDescription,
      author: {
        '@type': 'Person',
        name: thread.creator,
      },
      datePublished: thread.createdAt,
      dateModified: thread.updatedAt,
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: thread.replies,
      },
      mainEntity: posts.map((post: any) => ({
        '@type': 'Comment',
        text: post.content,
        author: {
          '@type': 'Person',
          name: `${post.author.fname} ${post.author.lname}`,
        },
        datePublished: post.createdAt,
        parentItem: thread._id,
        replyCount: post.replies,
      })),
    };
    console.log(thread.title)
    return {
      title: thread.title,
      description: sanitizedDescription,
      openGraph: {
        title: thread.title,
        description: sanitizedDescription,
        url: `https://yourforum.com/thread/${id}`,
        images: thread.imageUrl ? [{ url: thread.imageUrl, alt: thread.title }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: thread.title,
        description: sanitizedDescription,
        images: thread.imageUrl,
      },
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  } catch (error) {
    console.error('Failed to fetch data for metadata', error);
    return {
      title: 'Error Loading Thread',
      description: 'An error occurred while loading this thread.',
    };
  }
}

// Page Component
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="bg-gray-100 py-10 min-h-screen">
    <div className="max-w-screen-2xl mx-auto px-2 2xl:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="xl:col-span-2 col-span-12">
            <LeftFilter  />
          </aside>

        {/* Main Content */}
        <section className="col-span-12 xl:col-span-7">
          <div className="relative w-full h-fit mb-4  rounded-lg">
            <Suspense fallback={<DiscussionSkeleton/>}>
              <Discussion threadID={id} />
            </Suspense>
          </div>

          <div className="relative w-full h-fit  rounded-lg">
            <Suspense fallback={<DiscussionPostSkeleton/>}>
              <DiscussionPosts threadID={id} />
            </Suspense>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="col-span-12 xl:col-span-3">
          <div className="bg-white shadow-sm rounded-xl p-6 sticky top-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Create a Discussion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Share your thoughts, ask questions, or start a conversation.
            </p>
            <Link
              className={buttonVariants({
                className: "w-full mt-4 mb-6 text-sm",
              })}
              href="/community/create"
            >
              New Discussion
            </Link>
          </div>
        </aside>
      </div>
    </div>
  </div>
  );
}
