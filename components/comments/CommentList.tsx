import type { PublicComment } from "@/lib/comments";
import { formatRelativeTime } from "@/lib/relative-time";

const avatarColorClassNames = ["bg-brand", "bg-[#00A661]", "bg-[#8B95A1]"];

export function CommentList({ comments }: { comments: PublicComment[] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-text-muted">아직 댓글이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment, index) => (
        <article key={comment.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5 xl:p-4">
          <div className="flex h-[30px] items-center gap-2.5 md:h-8 xl:h-9">
            <span className={`flex size-[30px] items-center justify-center rounded-full text-[11px] font-medium leading-[1.35] text-white md:size-8 xl:size-[34px] xl:text-xs ${avatarColorClassNames[index % avatarColorClassNames.length]}`}>
              {comment.nickname.slice(0, 1)}
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="text-[13px] font-medium leading-[1.35] text-foreground xl:leading-[1.38]">{comment.nickname}</p>
              <span className="text-xs leading-[1.35] text-text-muted">{formatRelativeTime(comment.createdAt)}</span>
            </div>
          </div>
          <p className="text-[13px] leading-[18px] text-text-strong xl:text-sm xl:leading-[19px]">{comment.body}</p>
        </article>
      ))}
    </div>
  );
}
