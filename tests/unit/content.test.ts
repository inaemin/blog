import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate, getAllTags, getPostBySlug, getPublishedCraftItems, getPublishedPosts } from "@/lib/content";

describe("content queries", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns only published posts for public lists", async () => {
    const posts = await getPublishedPosts();
    const slugs = posts.map((post) => post.slug);

    expect(slugs).toEqual(["first-post"]);
    expect(slugs).toContain("first-post");
    expect(slugs).not.toContain("test-example");
    expect(slugs).not.toContain("nextjs-app-router-cache-strategy");
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

    expect(slugs).toContain("first-post");
    expect(slugs).toContain("test-example");
    expect(slugs).toContain("nextjs-app-router-cache-strategy");
    await expect(getPostBySlug("test-example")).resolves.toMatchObject({
      slug: "test-example",
      status: "draft",
    });
    await expect(getAllTags()).resolves.toEqual(["Essay"]);
  });

  it("collects tags from published posts only", async () => {
    const tags = await getAllTags();

    expect(tags).toEqual(["Essay"]);
    expect(tags).not.toContain("Caching");
    expect(tags).not.toContain("Next.js");
    expect(tags).not.toContain("Draft");
    expect(tags).not.toContain("test");
  });

  it("returns no craft items before craft content is published", async () => {
    const craftItems = await getPublishedCraftItems();

    expect(craftItems).toEqual([]);
  });

  it("returns no craft items when the craft content directory is missing", async () => {
    const craftDirectory = path.join(process.cwd(), "content", "craft");
    const backupDirectory = path.join(process.cwd(), "content", ".craft-test-backup");

    await rm(backupDirectory, { force: true, recursive: true });
    await rename(craftDirectory, backupDirectory).catch((error: unknown) => {
      if (!isMissingDirectoryError(error)) {
        throw error;
      }
    });

    try {
      await expect(getPublishedCraftItems()).resolves.toEqual([]);
    } finally {
      await mkdir(path.dirname(craftDirectory), { recursive: true });
      await rename(backupDirectory, craftDirectory).catch((error: unknown) => {
        if (!isMissingDirectoryError(error)) {
          throw error;
        }
      });
    }
  });

  it("formats known and missing dates", () => {
    expect(formatDate("2026-07-10")).toBe("2026.07.10");
    expect(formatDate()).toBe("날짜 미정");
  });
});

function isMissingDirectoryError(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
