import type { Post } from "@/lib/content";
import { PostListItem } from "./PostListItem";

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div>
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} />
      ))}
    </div>
  );
}
