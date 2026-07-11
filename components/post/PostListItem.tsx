import Link from "next/link";
import Image from "next/image";
import { formatDate, type ContentStatus, type Post } from "@/lib/content";
import { PostTag } from "./PostTag";

function getStatusLabel(status: ContentStatus) {
  if (status === "draft") {
    return "Draft";
  }

  if (status === "private") {
    return "Private";
  }

  return undefined;
}

function getArticleClassName(status: ContentStatus) {
  const baseClassName = "border-b border-border py-5 md:py-6 xl:py-7";

  if (status === "draft") {
    return `${baseClassName} rounded-2xl border border-dashed border-[#F2C94C] bg-[#FFF8E1] px-3.5`;
  }

  if (status === "private") {
    return `${baseClassName} rounded-2xl border border-dashed border-[#9AA4B2] bg-card px-3.5 opacity-80`;
  }

  return baseClassName;
}

function getStatusBadgeClassName(status: ContentStatus) {
  if (status === "draft") {
    return "rounded-full border border-[#F2C94C] bg-[#FFF3BF] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8A5A00]";
  }

  return "rounded-full border border-[#9AA4B2] bg-surface px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted";
}

function renderStatusBadge(status: ContentStatus) {
  const statusLabel = getStatusLabel(status);

  if (!statusLabel) {
    return null;
  }

  return <span className={getStatusBadgeClassName(status)}>{statusLabel}</span>;
}

function PostThumbnail({
  post,
  href,
  fallbackLabel,
}: {
  post: Post;
  href: string;
  fallbackLabel: string;
}) {
  if (!post.thumbnail) {
    return (
      <Link
        href={href}
        className="hidden h-20 w-29 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-card text-xs font-medium text-brand md:flex xl:h-22 xl:w-32"
      >
        <span className="px-3.5 text-center xl:px-4">{fallbackLabel}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="hidden h-20 w-29 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-card text-xs font-medium text-brand md:flex xl:h-22 xl:w-32"
    >
      <Image
        src={post.thumbnail}
        alt={`${post.title} 썸네일`}
        width={128}
        height={88}
        className="size-full object-cover"
      />
    </Link>
  );
}

export function PostListItem({ post }: { post: Post }) {
  const primaryTag = post.tags[0] ?? "Blog";
  const postHref = `/posts/${post.slug}`;

  return (
    <article
      className={getArticleClassName(post.status)}
      data-content-status={post.status}
    >
      <div className="flex gap-4 md:items-center xl:gap-4.5">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <PostTag>{primaryTag}</PostTag>
            {renderStatusBadge(post.status)}
            <span className="text-xs text-text-muted xl:text-[13px]">
              {formatDate(post.publishedAt)} · {post.readingTime}
            </span>
          </div>
          <h2 className="text-lg leading-[1.28] font-bold text-foreground md:text-[19px] md:leading-tight xl:text-xl">
            <Link href={postHref} className="hover:text-brand">
              {post.title}
            </Link>
          </h2>
          <Link
            href={postHref}
            className="line-clamp-2 text-[13px] leading-[1.35] text-text-secondary hover:text-text-strong xl:text-sm"
          >
            {post.description}
          </Link>
        </div>
        <PostThumbnail post={post} href={postHref} fallbackLabel={primaryTag} />
      </div>
    </article>
  );
}
