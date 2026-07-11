import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostListItem } from "@/components/post/PostListItem";
import type { Post } from "@/lib/content";

function createPost(status: Post["status"]): Post {
  return {
    title: `${status} post`,
    description: `${status} description`,
    publishedAt: "2026-07-10",
    slug: `${status}-post`,
    tags: ["Next.js"],
    readingTime: "1분 읽기",
    status,
    body: "본문",
  };
}

function createPostWithThumbnail(): Post {
  return {
    ...createPost("published"),
    thumbnail: "https://pbs.twimg.com/media/Ft-tVAqaUAAoXg4.jpg",
    title: "첫 글",
  };
}

describe("PostListItem", () => {
  it("keeps published items visually neutral", () => {
    const html = renderToStaticMarkup(<PostListItem post={createPost("published")} />);

    expect(html).toContain('data-content-status="published"');
    expect(html).toContain('href="/tags/Next.js"');
    expect(html).toContain('aria-label="Next.js 태그 글 보기"');
    expect(html).toContain('href="/posts/published-post"');
    expect(html).not.toContain("Draft");
    expect(html).not.toContain("Private");
    expect(html).not.toContain("border-dashed");
  });

  it("marks draft and private items with distinct review states", () => {
    const draftHtml = renderToStaticMarkup(<PostListItem post={createPost("draft")} />);
    const privateHtml = renderToStaticMarkup(<PostListItem post={createPost("private")} />);

    expect(draftHtml).toContain('data-content-status="draft"');
    expect(draftHtml).toContain("Draft");
    expect(draftHtml).toContain("border-dashed");
    expect(draftHtml).toContain("#FFF8E1");

    expect(privateHtml).toContain('data-content-status="private"');
    expect(privateHtml).toContain("Private");
    expect(privateHtml).toContain("border-dashed");
    expect(privateHtml).toContain("opacity-80");
  });

  it("renders a thumbnail image when thumbnail metadata exists", () => {
    const html = renderToStaticMarkup(<PostListItem post={createPostWithThumbnail()} />);

    expect(html).toContain("Ft-tVAqaUAAoXg4.jpg");
    expect(html).toContain('alt="첫 글 썸네일"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('object-cover');
  });

  it("falls back to the primary tag when thumbnail metadata is missing", () => {
    const html = renderToStaticMarkup(<PostListItem post={createPost("published")} />);

    expect(html).not.toContain("<img");
    expect(html).toContain(">Next.js</span>");
  });
});
