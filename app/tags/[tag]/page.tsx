import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { PostList } from "@/components/post/PostList";
import { getAllTags, getPublishedPosts } from "@/lib/content";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `${decodedTag} 태그`,
    description: `${decodedTag} 태그가 포함된 글 목록입니다.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = (await getPublishedPosts()).filter((post) => post.tags.includes(decodedTag));

  if (posts.length === 0) {
    notFound();
  }

  return (
    <PageShell>
      <section className="flex max-w-216.25 flex-col gap-4.5 md:gap-5 xl:gap-5.5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-base font-medium leading-[1.18] md:text-lg xl:text-xl">{decodedTag}</h1>
          <p className="text-sm text-text-muted">{posts.length}개의 글이 있습니다.</p>
        </div>
        <PostList posts={posts} />
      </section>
    </PageShell>
  );
}
