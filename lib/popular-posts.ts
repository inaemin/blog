import type { Post } from "./content";
import { getStrictPublishedPosts } from "./content";

type AnalyticsEnv = {
  projectId: string;
  teamId?: string;
  token: string;
};
type AnalyticsRow = Record<string, number | string | null | undefined>;

const analyticsEndpoint = "https://api.vercel.com/v1/query/web-analytics/visits/aggregate";
const postPathPrefix = "/posts/";

function getAnalyticsEnv(): AnalyticsEnv | undefined {
  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_ACCESS_TOKEN;

  if (!projectId || !token) {
    return undefined;
  }

  return { projectId, teamId: process.env.VERCEL_TEAM_ID, token };
}

function getSinceDate() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

function appendTeamId(params: URLSearchParams, teamId: string | undefined) {
  if (!teamId) {
    return params;
  }

  params.set("teamId", teamId);
  return params;
}

function buildAnalyticsParams(env: AnalyticsEnv) {
  const params = new URLSearchParams(getBaseAnalyticsParams(env.projectId));
  return appendTeamId(params, env.teamId);
}

function getBaseAnalyticsParams(projectId: string) {
  return {
    projectId,
    since: getSinceDate(),
    until: new Date().toISOString(),
    by: "requestPath",
    limit: "100",
    filter: "startswith(requestPath, '/posts/')",
  };
}

function buildAnalyticsUrl(env: AnalyticsEnv) {
  const params = buildAnalyticsParams(env);
  return `${analyticsEndpoint}?${params.toString()}`;
}

function buildAnalyticsFetchOptions(token: string): RequestInit {
  return { headers: { authorization: `Bearer ${token}` } };
}

async function fetchAnalyticsRows() {
  const env = getAnalyticsEnv();

  if (!env) {
    return [];
  }

  const response = await fetch(buildAnalyticsUrl(env), buildAnalyticsFetchOptions(env.token));
  return readAnalyticsRows(response);
}

async function readAnalyticsRows(response: Response): Promise<AnalyticsRow[]> {
  if (!response.ok) {
    return [];
  }

  const payload: unknown = await response.json();
  return getAnalyticsRows(payload);
}

function getAnalyticsRows(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    return [];
  }

  return payload.data.filter(isAnalyticsRow);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAnalyticsRow(value: unknown): value is AnalyticsRow {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.requestPath === "string";
}

function toSlug(pathValue: AnalyticsRow[string]) {
  if (typeof pathValue !== "string" || !pathValue.startsWith(postPathPrefix)) {
    return undefined;
  }

  return pathValue.slice(postPathPrefix.length).split("/")[0];
}

function toScore(scoreValue: AnalyticsRow[string]) {
  if (typeof scoreValue === "number") {
    return scoreValue;
  }

  return 0;
}

function buildScoreEntries(rows: AnalyticsRow[]) {
  return rows.flatMap((row) => {
    const slug = toSlug(row.requestPath);

    if (!slug) {
      return [];
    }

    return [[slug, toScore(row.pageviews)]] as const;
  });
}

async function getAnalyticsScores() {
  const rows = await fetchAnalyticsRows().catch(() => []);
  return new Map(buildScoreEntries(rows));
}

function toRankedPost(post: Post, score: number) {
  return {
    slug: post.slug,
    title: post.title,
    tag: post.tags[0] ?? "Blog",
    score,
  };
}

function byScoreDesc(a: { score: number }, b: { score: number }) {
  return b.score - a.score;
}

function withRank(post: ReturnType<typeof toRankedPost>, index: number) {
  return { ...post, rank: index + 1 };
}

export async function getPopularPosts() {
  const posts = await getStrictPublishedPosts();
  const scores = await getAnalyticsScores();
  return posts
    .map((post) => toRankedPost(post, scores.get(post.slug) ?? 0))
    .sort(byScoreDesc)
    .slice(0, 3)
    .map(withRank);
}
