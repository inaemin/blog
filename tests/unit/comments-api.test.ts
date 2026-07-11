import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/comments/route";
import { getPreviewCommentsByPostSlug } from "@/lib/comments";

function createRequest(url: string, body?: unknown) {
  return new Request(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    method: body === undefined ? "GET" : "POST",
  });
}

describe("comments API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires postSlug for comment lookup", async () => {
    const response = await GET(createRequest("http://localhost/api/comments"));
    const payload = await response.json();

    expect(payload).toMatchObject({ code: "INVALID_INPUT", ok: false });
    expect(payload).not.toHaveProperty("comments");
    expect(response.status).toBe(400);
  });

  it("does not return comments for a private post", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_your_server_only_key");
    const response = await GET(
      createRequest(
        "http://localhost/api/comments?postSlug=nextjs-app-router-cache-strategy",
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.comments).toEqual([]);
  });

  it("does not return comments for draft or private posts", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_your_server_only_key");
    const response = await GET(
      createRequest("http://localhost/api/comments?postSlug=test-example"),
    );

    await expect(response.json()).resolves.toEqual({ comments: [] });
    expect(response.status).toBe(200);
  });

  it("returns draft post comments for development previews", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_your_server_only_key");

    await expect(getPreviewCommentsByPostSlug("test-example")).resolves.toEqual(
      [
        expect.objectContaining({
          body: "draft preview comment",
          postSlug: "test-example",
        }),
      ],
    );
  });

  it("returns private post comments for development previews", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_your_server_only_key");

    await expect(
      getPreviewCommentsByPostSlug("nextjs-app-router-cache-strategy"),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          articleTitle: "Next.js App Router 캐시 전략 정리",
          createdAt: expect.any(String),
          postSlug: "nextjs-app-router-cache-strategy",
        }),
      ]),
    );
  });

  it("rejects invalid comment submissions", async () => {
    const response = await POST(
      createRequest("http://localhost/api/comments", {
        comment: "missing slug",
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: "INVALID_INPUT",
      ok: false,
    });
    expect(response.status).toBe(400);
  });

  it("rejects comment submissions with a filled honeypot", async () => {
    const response = await POST(
      createRequest("http://localhost/api/comments", {
        comment: "좋은 글 감사합니다.",
        honeypot: "https://spam.example",
        nickname: "재미있는나비",
        postSlug: "nextjs-app-router-cache-strategy",
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: "INVALID_INPUT",
      ok: false,
    });
    expect(response.status).toBe(400);
  });

  it("accepts valid comment submissions as approved", async () => {
    const response = await POST(
      createRequest("http://localhost/api/comments", {
        comment: "좋은 글 감사합니다.",
        nickname: "재미있는나비",
        postSlug: "nextjs-app-router-cache-strategy",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "approved",
    });
    expect(response.status).toBe(201);
  });
});
