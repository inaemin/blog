import Link from "next/link";
import { LatestCommentsSection } from "@/components/home/LatestCommentsSection";
import { PopularPostsSection } from "@/components/home/PopularPostsSection";
import { PageShell } from "@/components/layout/PageShell";
import { PostList } from "@/components/post/PostList";
import { TagsSection } from "@/components/tags/TagsSection";
import { getAllTags, getPublishedPosts } from "@/lib/content";

export default async function Home() {
  const posts = await getPublishedPosts();
  const tags = await getAllTags();

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[865px_295px] xl:gap-10">
        <section className="flex flex-col gap-4.5 md:gap-5 xl:gap-5.5" aria-labelledby="latest-posts-title">
          <div className="flex items-center justify-between">
            <h1 id="latest-posts-title" className="text-base font-medium leading-[1.18] md:text-lg xl:text-xl">
              최신 글
            </h1>
            <Link href="/posts" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand">
              <span>전체보기</span>
              <svg aria-hidden="true" className="size-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <PostList posts={posts.slice(0, 5)} />
        </section>
        <aside className="space-y-3.5 xl:space-y-2.5">
          <TagsSection tags={tags} />
          <PopularPostsSection />
          <LatestCommentsSection />
        </aside>
      </div>
    </PageShell>
  );
}
