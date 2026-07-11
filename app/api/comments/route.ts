import { NextResponse } from "next/server";
import { createComment, getCommentsByPostSlug } from "@/lib/comments";

const errorMessages = {
  INVALID_INPUT: "입력값을 확인해주세요.",
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const postSlug = url.searchParams.get("postSlug");

  if (!postSlug) {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", message: errorMessages.INVALID_INPUT },
      { status: 400 },
    );
  }

  const comments = await getCommentsByPostSlug(postSlug);
  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.comment !== "string" || typeof body.nickname !== "string" || typeof body.postSlug !== "string") {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", message: errorMessages.INVALID_INPUT },
      { status: 400 },
    );
  }

  if (body.comment.trim().length === 0 || body.nickname.trim().length === 0 || body.postSlug.trim().length === 0) {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", message: errorMessages.INVALID_INPUT },
      { status: 400 },
    );
  }

  if (typeof body.honeypot === "string" && body.honeypot.trim().length > 0) {
    return NextResponse.json(
      { ok: false, code: "INVALID_INPUT", message: errorMessages.INVALID_INPUT },
      { status: 400 },
    );
  }

  const comment = await createComment({
    body: body.comment.trim(),
    nickname: body.nickname.trim(),
    postSlug: body.postSlug.trim(),
  });

  return NextResponse.json({ ok: true, status: comment.status }, { status: 201 });
}
