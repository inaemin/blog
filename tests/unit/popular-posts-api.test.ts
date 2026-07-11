import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/popular-posts/route";

describe("popular posts API", () => {
  it("returns no popular posts without strict published content", async () => {
    const response = await GET();
    const payload = await response.json();
    const slugs = payload.posts.map((post: { slug: string }) => post.slug);

    expect(response.status).toBe(200);
    expect(payload.posts).toEqual([]);
    expect(slugs).not.toContain("nextjs-app-router-cache-strategy");
    expect(slugs).not.toContain("test-example");
    expect(slugs).not.toContain("private-draft-example");
  });
});
