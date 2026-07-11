import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PostList } from "@/components/post/PostList";
import { TagsSection } from "@/components/tags/TagsSection";
import { getAllTags, getPublishedPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "전체 글",
  description: "Annie Way의 전체 기술 글 목록입니다.",
};

export default async function PostsPage() {
  const posts = await getPublishedPosts();
  const tags = await getAllTags();

  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[865px_295px] xl:gap-10">
        <section className="flex flex-col gap-[18px] md:gap-5 xl:gap-[22px]">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-base font-medium leading-[1.18] md:text-lg xl:text-xl">전체 글</h1>
            <p className="text-sm text-text-muted">총 {posts.length}개의 글이 있습니다.</p>
          </div>
          <PostList posts={posts} />
        </section>
        <aside>
          <TagsSection tags={tags} />
        </aside>
      </div>
    </PageShell>
  );
}
