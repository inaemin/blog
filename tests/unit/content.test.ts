import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate, getAllTags, getPostBySlug, getPublishedCraftItems, getPublishedPosts } from "@/lib/content";

describe("content queries", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns only published posts for public lists", async () => {
    const posts = await getPublishedPosts();
    const slugs = posts.map((post) => post.slug);

    expect(slugs).not.toContain("test-example");
    expect(slugs).toContain("nextjs-app-router-cache-strategy");
    expect(slugs).not.toContain("private-draft-example");
  });

  it("does not resolve draft or private posts by slug outside development", async () => {
    await expect(getPostBySlug("test-example")).resolves.toBeUndefined();
    await expect(getPostBySlug("private-draft-example")).resolves.toBeUndefined();
  });

  it("includes draft and private posts while running in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const posts = await getPublishedPosts();
    const slugs = posts.map((post) => post.slug);

    expect(slugs).toContain("test-example");
    expect(slugs).toContain("private-draft-example");
    await expect(getPostBySlug("test-example")).resolves.toMatchObject({
      slug: "test-example",
      status: "draft",
    });
    await expect(getPostBySlug("private-draft-example")).resolves.toMatchObject({
      slug: "private-draft-example",
      status: "private",
    });
    await expect(getAllTags()).resolves.toEqual(["Caching", "Frontend", "Next.js", "Performance", "React", "RSC"]);
  });

  it("collects tags from published posts only", async () => {
    const tags = await getAllTags();

    expect(tags).toEqual(["Caching", "Frontend", "Next.js", "Performance", "React", "RSC"]);
    expect(tags).not.toContain("Draft");
    expect(tags).not.toContain("test");
  });

  it("returns no craft items before craft content is published", async () => {
    const craftItems = await getPublishedCraftItems();

    expect(craftItems).toEqual([]);
  });

  it("formats known and missing dates", () => {
    expect(formatDate("2026-07-10")).toBe("2026.07.10");
    expect(formatDate()).toBe("날짜 미정");
  });
});
