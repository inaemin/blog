import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { PageShell } from "@/components/layout/PageShell";
import { DesktopArticleToc, InlineArticleToc } from "@/components/post/ArticleToc";
import { extractMarkdownHeadings, MarkdownBody } from "@/components/post/MarkdownBody";
import { PostTag } from "@/components/post/PostTag";
import { getPreviewCommentsByPostSlug } from "@/lib/comments";
import { formatDate, getPostBySlug, getPublishedPosts } from "@/lib/content";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "글을 찾을 수 없습니다" };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const comments = await getPreviewCommentsByPostSlug(post.slug);
  const headings = extractMarkdownHeadings(post.body);

  return (
    <PageShell>
      <div className="relative grid min-w-0 gap-8 xl:grid-cols-[820px_295px] xl:gap-16 xl:pt-3.5">
        <article className="flex min-w-0 flex-col gap-12">
          <div id="article-reading-content" className="flex min-w-0 flex-col gap-5.5 md:gap-6.5 xl:gap-10">
            <header className="flex flex-col gap-4 border-b border-border pb-5 md:gap-4.5 md:pt-2 xl:gap-5">
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <PostTag key={tag}>{tag}</PostTag>
                ))}
              </div>
              <h1 className="text-[28px] font-bold leading-8.5 text-foreground md:text-[34px] md:leading-10.25 xl:text-[38px] xl:leading-11">
                {post.title}
              </h1>
              <p className="text-sm leading-5 text-text-secondary">{post.description}</p>
              <p className="flex flex-wrap items-center gap-2.5 text-xs leading-4 text-text-muted md:text-[13px] md:leading-4.5">
                <span>{formatDate(post.publishedAt)}</span>
                <span>{post.readingTime}</span>
              </p>
            </header>
            <InlineArticleToc headings={headings} />
            <MarkdownBody body={post.body} />
          </div>
          <CommentsSection articleTitle={post.title} comments={comments} postSlug={post.slug} />
        </article>
        <DesktopArticleToc headings={headings} />
      </div>
    </PageShell>
  );
}
