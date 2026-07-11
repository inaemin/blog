import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/popular-posts/route";

describe("popular posts API", () => {
  it("returns ranked popular posts derived from strict published content", async () => {
    const response = await GET();
    const payload = await response.json();
    const slugs = payload.posts.map((post: { slug: string }) => post.slug);

    expect(response.status).toBe(200);
    expect(payload.posts).toHaveLength(3);
    expect(payload.posts[0]).toMatchObject({ rank: 1, slug: "nextjs-app-router-cache-strategy", tag: "Next.js" });
    expect(slugs).not.toContain("test-example");
    expect(slugs).not.toContain("private-draft-example");
  });
});
