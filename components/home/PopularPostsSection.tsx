import Link from "next/link";
import { getPopularPosts } from "@/lib/popular-posts";

export async function PopularPostsSection() {
  const posts = await getPopularPosts();
  const hasPosts = posts.length > 0;

  return (
    <section
      className="flex flex-col gap-3 rounded-[18px] bg-card p-4 md:p-4.5"
      aria-labelledby="popular-posts-title"
    >
      <h2
        id="popular-posts-title"
        className="text-sm leading-tight font-medium text-foreground"
      >
        인기 있는 글
      </h2>
      <div className="space-y-3">
        {hasPosts &&
          posts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="flex items-baseline gap-2.5 rounded-xl p-2 hover:bg-surface/60"
            >
              <span className="w-6 shrink-0 font-mono text-xs leading-[1.28] font-medium text-brand">
                {String(post.rank).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="line-clamp-2 text-[13px] leading-[1.28] font-medium text-foreground">
                  {post.title}
                </span>
                <span className="text-xs leading-[1.2] text-text-muted">
                  {post.tag}
                </span>
              </span>
            </Link>
          ))}
        {!hasPosts && (
          <p className="text-xs text-text-muted">인기 글을 집계 중입니다.</p>
        )}
      </div>
    </section>
  );
}
