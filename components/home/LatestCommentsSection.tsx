import Link from "next/link";
import { getLatestComments } from "@/lib/comments";
import { formatRelativeTime } from "@/lib/relative-time";

function getCommentClassName() {
  return "flex flex-col gap-1.5 rounded-xl bg-surface p-2.5 md:border md:border-border md:px-[11px]";
}

export async function LatestCommentsSection() {
  const comments = (await getLatestComments()).slice(0, 3);
  const hasComments = comments.length > 0;

  return (
    <section
      className="flex flex-col gap-2.5 rounded-[18px] bg-card p-3.5 xl:p-4"
      aria-labelledby="latest-comments-title"
    >
      <h2
        id="latest-comments-title"
        className="text-sm leading-tight font-medium text-foreground"
      >
        최신 댓글
      </h2>
      <div className="space-y-2.5">
        {hasComments &&
          comments.map((comment) => (
            <article key={comment.id} className={getCommentClassName()}>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-tag-bg text-[11px] font-medium text-brand">
                  {comment.nickname.slice(0, 1)}
                </span>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    {comment.nickname}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
              </div>
              <p className="line-clamp-2 text-xs leading-[1.32] text-text-secondary">
                {comment.body}
              </p>
              <Link
                href={`/posts/${comment.postSlug}`}
                className="block truncate text-[11px] leading-[1.2] font-medium text-brand"
              >
                {comment.articleTitle}
              </Link>
            </article>
          ))}
        {!hasComments && (
          <p className="text-xs text-text-muted">아직 댓글이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
