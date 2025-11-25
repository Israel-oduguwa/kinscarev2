import DiscussionPost from "./DiscussionPost";
import { QuoteProvider } from "@/lib/context/QuoteContext";
interface PostProps {
  threadID: string;
}

async function DiscussionPosts({ threadID }: PostProps) {
  let data = await fetch(
    `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/forum/threads/${threadID}/posts`,
    // { next: { revalidate:1 } }
    { cache: "no-cache" }
  );
  // So the discussion are refreshed every 60 minutes to prevent the excess update from the server
  const response = await data.json();
  const { posts }: any = response;
  // console.log(response.posts);

  return (
    <div>
      <div className="w-full">
        {posts && (
          <>
            <h2 className="antialiased text-lg mb-4 font-semibold">
              {posts.length} Posts
            </h2>
            <div>
              <DiscussionPost threadID={threadID} posts={posts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DiscussionPosts;
