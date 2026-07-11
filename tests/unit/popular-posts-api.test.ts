import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/popular-posts/route";

describe("popular posts API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns ranked popular posts derived from strict published content", async () => {
    const response = await GET();
    const payload = await response.json();
    const slugs = payload.posts.map((post: { slug: string }) => post.slug);

    expect(response.status).toBe(200);
    expect(payload.posts).toEqual([
      expect.objectContaining({ rank: 1, slug: "first-post", tag: "Essay" }),
    ]);
    expect(slugs).toContain("first-post");
    expect(slugs).not.toContain("nextjs-app-router-cache-strategy");
    expect(slugs).not.toContain("test-example");
    expect(slugs).not.toContain("private-draft-example");
  });

  it("uses Vercel Analytics page views when metrics are configured", async () => {
    vi.stubEnv("VERCEL_ACCESS_TOKEN", "vercel-token");
    vi.stubEnv("VERCEL_PROJECT_ID", "prj_blog");
    vi.stubEnv("VERCEL_TEAM_ID", "team_blog");
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({
      data: [{ requestPath: "/posts/first-post", pageviews: 42, visitors: 12 }],
      query: {},
      version: 1,
    })));

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.posts).toEqual([
      expect.objectContaining({ rank: 1, score: 42, slug: "first-post" }),
    ]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.vercel.com/v1/query/web-analytics/visits/aggregate?"),
      expect.objectContaining({ headers: { authorization: "Bearer vercel-token" } }),
    );
  });
});
