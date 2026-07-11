import { createClient } from "@supabase/supabase-js";
import { getPublishedPosts, getStrictPublishedPosts } from "./content";

export type PublicComment = {
  id: string;
  postSlug: string;
  articleTitle: string;
  nickname: string;
  body: string;
  createdAt: string;
};
export type CreateCommentInput = {
  body: string;
  nickname: string;
  postSlug: string;
};

type CommentRow = {
  body: string;
  created_at: string;
  id: string;
  nickname: string;
  post_slug: string;
};
type CommentVisibility = "preview" | "public";

const sampleComments: PublicComment[] = [
  {
    id: "sample-draft-1",
    postSlug: "test-example",
    articleTitle: "test",
    nickname: "재미있는나비",
    body: "draft preview comment",
    createdAt: "2026-07-11T16:14:58.876Z",
  },
  {
    id: "sample-1",
    postSlug: "nextjs-app-router-cache-strategy",
    articleTitle: "Next.js App Router 캐시 전략 정리",
    nickname: "푸른나비",
    body: "사용자별 데이터와 공개 목록을 나눠 설명해서 캐시 기준이 더 명확해졌어요.",
    createdAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "sample-2",
    postSlug: "react-server-components-practical-guide",
    articleTitle: "React Server Components를 실무에 들이는 기준",
    nickname: "수아",
    body: "LCP 이미지 우선순위 설명이 특히 도움 됐습니다.",
    createdAt: "2026-07-09T12:00:00.000Z",
  },
  {
    id: "sample-3",
    postSlug: "performance-budget-product-decisions",
    articleTitle: "성능 예산을 제품 의사결정에 연결하기",
    nickname: "지훈",
    body: "디자인 토큰을 CSS 변수로 묶는 흐름이 실무적이에요.",
    createdAt: "2026-07-08T14:30:00.000Z",
  },
  {
    id: "sample-4",
    postSlug: "nextjs-app-router-cache-strategy",
    articleTitle: "Next.js App Router 캐시 전략 정리",
    nickname: "느긋한고래",
    body: "revalidate 기준을 예시로 보니 팀에서 합의하기 쉬울 것 같아요.",
    createdAt: "2026-07-07T10:20:00.000Z",
  },
  {
    id: "sample-5",
    postSlug: "nextjs-app-router-cache-strategy",
    articleTitle: "Next.js App Router 캐시 전략 정리",
    nickname: "명랑한여우",
    body: "서버 액션 이후 재검증 흐름을 실제 작업에 바로 적용해볼 수 있겠어요.",
    createdAt: "2026-07-06T08:10:00.000Z",
  },
];

function getSupabaseConfig() {
  return {
    secretKey: process.env.SUPABASE_SECRET_KEY ?? "",
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  };
}

function isSupabaseConfigured() {
  if (process.env.COMMENTS_FIXTURE_MODE === "true") {
    return false;
  }

  const { secretKey, url } = getSupabaseConfig();
  return url.startsWith("https://") && secretKey.startsWith("sb_secret_") && secretKey !== "sb_secret_your_server_only_key";
}

function getSupabaseAdminClient() {
  const { secretKey, url } = getSupabaseConfig();
  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}

function shouldIncludePreviewPosts(visibility: CommentVisibility) {
  return visibility === "preview" && process.env.NODE_ENV === "development";
}

async function getPostsForCommentVisibility(visibility: CommentVisibility) {
  if (shouldIncludePreviewPosts(visibility)) {
    return getPublishedPosts();
  }

  return getStrictPublishedPosts();
}

async function getArticleTitleBySlug(visibility: CommentVisibility) {
  const posts = await getPostsForCommentVisibility(visibility);
  return new Map(posts.map((post) => [post.slug, post.title]));
}

async function getPublicPostSlugs(visibility: CommentVisibility) {
  const posts = await getPostsForCommentVisibility(visibility);
  return new Set(posts.map((post) => post.slug));
}

function toPublicComment(row: CommentRow, articleTitleBySlug: Map<string, string>): PublicComment {
  return {
    articleTitle: articleTitleBySlug.get(row.post_slug) ?? row.post_slug,
    body: row.body,
    createdAt: row.created_at,
    id: row.id,
    nickname: row.nickname,
    postSlug: row.post_slug,
  };
}

function getPublicCommentsQuery() {
  return getSupabaseAdminClient()
    .from("comments")
    .select("id, post_slug, nickname, body, created_at")
    .eq("status", "approved")
    .eq("hidden", false)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
}

function getScopedPublicCommentsQuery(postSlug?: string) {
  if (!postSlug) {
    return getPublicCommentsQuery();
  }

  return getPublicCommentsQuery().eq("post_slug", postSlug);
}

function throwCommentFetchError(message: string) {
  throw new Error(`Failed to fetch comments: ${message}`);
}

async function getPublicCommentsFromSupabase(postSlug?: string, visibility: CommentVisibility = "public") {
  const articleTitleBySlug = await getArticleTitleBySlug(visibility);
  const publicPostSlugs = await getPublicPostSlugs(visibility);
  const query = getScopedPublicCommentsQuery(postSlug);
  const { data, error } = await query;

  if (error) {
    throwCommentFetchError(error.message);
  }

  return (data ?? []).filter((row) => publicPostSlugs.has(row.post_slug)).map((row) => toPublicComment(row, articleTitleBySlug));
}

export async function getLatestComments(): Promise<PublicComment[]> {
  if (isSupabaseConfigured()) {
    return getPublicCommentsFromSupabase();
  }

  const publicPostSlugs = await getPublicPostSlugs("public");
  return sampleComments.filter((comment) => publicPostSlugs.has(comment.postSlug));
}

export async function getCommentsByPostSlug(postSlug: string, visibility: CommentVisibility = "public"): Promise<PublicComment[]> {
  const publicPostSlugs = await getPublicPostSlugs(visibility);

  if (!publicPostSlugs.has(postSlug)) {
    return [];
  }

  if (isSupabaseConfigured()) {
    return getPublicCommentsFromSupabase(postSlug, visibility);
  }

  return sampleComments.filter((comment) => comment.postSlug === postSlug);
}

export async function getPreviewCommentsByPostSlug(postSlug: string): Promise<PublicComment[]> {
  return getCommentsByPostSlug(postSlug, "preview");
}

function toCommentInsert(input: CreateCommentInput) {
  return { body: input.body, nickname: input.nickname, post_slug: input.postSlug, status: "approved" };
}

function throwCommentCreateError(message: string) {
  throw new Error(`Failed to create comment: ${message}`);
}

export async function createComment(input: CreateCommentInput) {
  if (!isSupabaseConfigured()) {
    return { status: "approved" };
  }

  const { error } = await getSupabaseAdminClient().from("comments").insert(toCommentInsert(input));

  if (error) {
    throwCommentCreateError(error.message);
  }

  return { status: "approved" };
}
