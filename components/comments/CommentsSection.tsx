"use client";

import { useState } from "react";
import type { PublicComment } from "@/lib/comments";
import { CommentComposer, type OptimisticCommentInput } from "./CommentComposer";
import { CommentList } from "./CommentList";

type CommentsSectionProps = {
  articleTitle: string;
  comments: PublicComment[];
  postSlug: string;
};
type CommentContext = {
  articleTitle: string;
  postSlug: string;
};

function createOptimisticComment(input: OptimisticCommentInput, context: CommentContext): PublicComment {
  return {
    articleTitle: context.articleTitle,
    body: input.body,
    createdAt: input.createdAt,
    id: input.id,
    nickname: input.nickname,
    postSlug: context.postSlug,
  };
}

export function CommentsSection({ articleTitle, comments, postSlug }: CommentsSectionProps) {
  const [visibleComments, setVisibleComments] = useState(comments);
  const commentContext = { articleTitle, postSlug };

  const addOptimisticComment = (input: OptimisticCommentInput) => {
    setVisibleComments((currentComments) => [createOptimisticComment(input, commentContext), ...currentComments]);
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="comments-title">
      <div className="flex items-center gap-1.5">
        <h2 id="comments-title" className="text-lg font-medium xl:text-xl">댓글</h2>
        <span className="text-xs font-medium leading-tight text-brand">{visibleComments.length}</span>
      </div>
      <CommentComposer onOptimisticComment={addOptimisticComment} postSlug={postSlug} />
      <CommentList comments={visibleComments} />
    </section>
  );
}
