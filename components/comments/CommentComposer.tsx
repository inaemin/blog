"use client";

import { type FormEvent, useState } from "react";

const randomNicknames = ["재미있는나비", "느긋한고래", "명랑한다람쥐", "푸른여우", "차분한수달", "반짝이는별"];

type SubmitState = "idle" | "submitting" | "success" | "error";
type SubmitDisabledInput = {
  comment: string;
  nickname: string;
  submitState: SubmitState;
};
type CommentPayload = {
  comment: string;
  honeypot: string;
  nickname: string;
  postSlug: string;
};
export type OptimisticCommentInput = {
  body: string;
  createdAt: string;
  id: string;
  nickname: string;
};
type CommentComposerProps = {
  onOptimisticComment: (comment: OptimisticCommentInput) => void;
  postSlug: string;
};

function getRandomNickname(currentNickname: string) {
  const candidates = randomNicknames.filter((nickname) => nickname !== currentNickname);
  const index = Math.floor(Math.random() * candidates.length);

  return candidates[index] ?? randomNicknames[0];
}

function getSubmitMessage(submitState: SubmitState) {
  if (submitState === "error") {
    return "댓글을 보내지 못했어요. 잠시 후 다시 시도해주세요.";
  }

  return "";
}

function createOptimisticInput(nickname: string, body: string): OptimisticCommentInput {
  return {
    body,
    createdAt: new Date().toISOString(),
    id: `optimistic-${Date.now()}`,
    nickname,
  };
}

function getSubmitMessageClassName() {
  return "text-xs leading-4 text-text-muted";
}

function isSubmitDisabled({ comment, nickname, submitState }: SubmitDisabledInput) {
  if (submitState === "submitting") {
    return true;
  }

  return nickname.trim().length === 0 || comment.trim().length === 0;
}

async function postComment(payload: CommentPayload) {
  try {
    const response = await fetch("/api/comments", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    return response.ok;
  } catch {
    return false;
  }
}

function getSubmitButtonLabel(submitState: SubmitState) {
  if (submitState === "submitting") {
    return "작성 중";
  }

  return "댓글 남기기";
}

export function CommentComposer({ onOptimisticComment, postSlug }: CommentComposerProps) {
  const [comment, setComment] = useState("");
  const [nickname, setNickname] = useState("재미있는나비");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const buttonSizeClassName = "h-[38px] rounded-lg px-3 text-[13px] font-medium leading-[1.35]";
  const submitMessage = getSubmitMessage(submitState);
  const submitDisabled = isSubmitDisabled({ comment, nickname, submitState });

  const randomizeNickname = () => {
    setNickname((currentNickname) => getRandomNickname(currentNickname));
    setSubmitState("idle");
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitDisabled({ comment, nickname, submitState })) {
      return;
    }

    const trimmedComment = comment.trim();
    const trimmedNickname = nickname.trim();
    const honeypot = new FormData(event.currentTarget).get("honeypot");

    setSubmitState("submitting");
    onOptimisticComment(createOptimisticInput(trimmedNickname, trimmedComment));
    await postComment({ comment: trimmedComment, honeypot: honeypot?.toString() ?? "", nickname: trimmedNickname, postSlug });

    setComment("");
    setSubmitState("success");
  };

  return (
    <form className="flex flex-col gap-2.5 rounded-lg border border-border bg-transparent p-3 md:p-4 xl:p-[18px]" onSubmit={submitComment}>
      <input type="hidden" name="postSlug" value={postSlug} />
      <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex h-[38px] items-center gap-2.5">
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-brand text-xs font-medium leading-[1.35] text-white">
          {nickname.slice(0, 1)}
        </span>
        <input
          type="text"
          name="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          className="h-[38px] min-w-0 flex-1 rounded-lg border border-border bg-transparent px-2 text-[13px] font-medium leading-[1.35] text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-tag-border"
        />
        <button type="button" className={`${buttonSizeClassName} border border-border bg-card text-text-secondary`} onClick={randomizeNickname}>
          랜덤 변경
        </button>
      </div>
      <textarea
        name="comment"
        value={comment}
        onChange={(event) => {
          setComment(event.target.value);
          setSubmitState("idle");
        }}
        placeholder="댓글을 남겨보세요."
        className="min-h-[58px] w-full resize-y rounded-lg border border-border bg-background px-3.5 py-3 text-[13px] leading-[1.35] text-foreground outline-none placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-tag-border"
      />
      <div className="flex min-h-[38px] flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className={getSubmitMessageClassName()} aria-live="polite">
          {submitMessage}
        </p>
        <button type="submit" className={`${buttonSizeClassName} bg-brand text-white disabled:cursor-not-allowed disabled:bg-text-muted`} disabled={submitDisabled}>
          {getSubmitButtonLabel(submitState)}
        </button>
      </div>
    </form>
  );
}
