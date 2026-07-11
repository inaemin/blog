import { expect, test } from "@playwright/test";

async function visibleCommentCount(page: import("@playwright/test").Page) {
  return page.locator('[aria-labelledby="latest-comments-title"] article:visible').count();
}

async function expectCommentButtonsToShareSize(page: import("@playwright/test").Page) {
  const randomizeButton = page.getByRole("button", { name: "랜덤 변경" });
  const submitButton = page.getByRole("button", { name: "댓글 남기기" });

  await expect(randomizeButton).toHaveCSS("height", "38px");
  await expect(submitButton).toHaveCSS("height", "38px");
  await expect(randomizeButton).toHaveCSS("font-size", "13px");
  await expect(submitButton).toHaveCSS("font-size", "13px");
  await expect(randomizeButton).toHaveCSS("border-radius", "8px");
  await expect(submitButton).toHaveCSS("border-radius", "8px");
}

async function expectDesktopTocRailForPost(page: import("@playwright/test").Page, slug: string, linkName: string, railHeight: string) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(`/posts/${slug}`);

  await expect(page.getByRole("complementary").getByRole("link", { name: linkName })).toBeVisible();
  await expect(page.getByRole("complementary").locator(".bg-rail")).toHaveCSS("height", railHeight);
  await expect(page.locator("blockquote").first()).toBeVisible();
  await expect(page.locator("pre").first()).toBeVisible();
  await expect(page.locator("figure").filter({ has: page.locator("figcaption") }).first()).toBeVisible();
}

test.describe("home responsive layout", () => {
  test("mobile keeps a single text-only column", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1401 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "메뉴 열기" });

    await expect(page.getByRole("banner")).toHaveCSS("height", "56px");
    await expect(menuButton.locator("svg")).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(menuButton).toHaveCSS("background-color", "rgb(235, 243, 255)");
    await expect(menuButton).toHaveCSS("border-color", "rgb(191, 217, 255)");
    await expect(menuButton).toHaveCSS("color", "rgb(27, 100, 218)");
    await expect(page.locator("div.absolute").getByRole("link", { name: "전체 글" })).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("div.absolute").getByRole("link", { name: "전체 글" })).toHaveCSS("color", "rgb(78, 89, 104)");
    await expect(page.locator('[aria-labelledby="tags-title"]')).toBeHidden();
    await expect(page.locator('[aria-labelledby="latest-posts-title"] article').first().locator("div.hidden")).toBeHidden();
    await expect(page.locator('[aria-labelledby="latest-posts-title"] [data-post-tag="true"]').first()).toHaveCSS("font-size", "12px");
    await expect(page.locator('[aria-labelledby="latest-comments-title"]').getByRole("link", { name: "Next.js App Router 캐시 전략 정리" }).first()).toBeVisible();
    await expect(page.locator('[aria-labelledby="latest-comments-title"] article').first()).toContainText(/\d+(초|분|시|일|달|년) 전/u);
    await expect.poll(() => visibleCommentCount(page)).toBe(3);
  });

  test("tablet shows thumbnails but stays single column", async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await page.goto("/");

    const thumbnail = page.locator('[aria-labelledby="latest-posts-title"] article div.hidden').first();
    const latestBox = await page.locator('[aria-labelledby="latest-posts-title"]').boundingBox();
    const asideBox = await page.locator("aside").boundingBox();

    await expect(thumbnail).toBeVisible();
    await expect(thumbnail).toHaveCSS("width", "116px");
    await expect(thumbnail).toHaveCSS("height", "80px");
    await expect(page.locator('[aria-labelledby="tags-title"]')).toBeHidden();
    await expect(page.locator('[aria-labelledby="latest-posts-title"] [data-post-tag="true"]').first()).toHaveCSS("font-size", "13px");
    expect(asideBox?.y).toBeGreaterThan(latestBox?.y ?? 0);
    await expect.poll(() => visibleCommentCount(page)).toBe(3);
  });

  test("desktop uses the two-column shell and shows tags", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/");

    await expect(page.locator("main")).toHaveCSS("width", "1200px");
    await expect(page.getByRole("navigation", { name: "주요 메뉴" }).locator("svg")).toHaveCount(2);
    await expect(page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "전체 글" })).toHaveCSS("color", "rgb(78, 89, 104)");
    await expect(page.locator('[aria-labelledby="latest-posts-title"]')).toHaveCSS("width", "865px");
    await expect(page.locator("aside")).toHaveCSS("width", "295px");
    await expect(page.locator('[aria-labelledby="tags-title"]')).toBeVisible();
    await expect(page.locator("aside > section").first()).toHaveAttribute("aria-labelledby", "tags-title");
    await expect(page.locator('[aria-labelledby="latest-posts-title"] article div.hidden').first()).toHaveCSS("width", "128px");
    await expect.poll(() => visibleCommentCount(page)).toBe(3);
  });

  test("posts desktop page shows the right tags section", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/posts");

    await expect(page.locator("main")).toHaveCSS("width", "1200px");
    await expect(page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "전체 글" })).toHaveCSS("color", "rgb(27, 100, 218)");
    await expect(page.locator("aside")).toHaveCSS("width", "295px");
    await expect(page.locator('[aria-labelledby="tags-title"]')).toBeVisible();
    await expect(page.locator("aside > section").first()).toHaveAttribute("aria-labelledby", "tags-title");
    await expect(page.locator('[data-post-tag="true"]').first()).toHaveCSS("font-size", "14px");
    await expect(page.locator('[aria-labelledby="tags-title"]').getByRole("link", { name: "Next.js" })).toBeVisible();
  });

  test("header stays over content and hides when only footer remains", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.goto("/posts");

    const header = page.locator("header");

    await expect(header).toHaveCSS("position", "sticky");
    await expect(header).toHaveAttribute("data-visible", "true");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(header).toHaveAttribute("data-visible", "true");

    await page.setViewportSize({ width: 390, height: 96 });
    await page.goto("/tags/Caching");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(header).toHaveAttribute("data-visible", "false");
  });

  test("short tag pages keep the footer at the viewport bottom", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tags/Caching");

    const footerBox = await page.locator("footer").boundingBox();

    expect(Math.round(footerBox?.y ?? 0) + Math.round(footerBox?.height ?? 0)).toBe(844);
  });

  test("craft page starts empty", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/craft");

    await expect(page.getByRole("heading", { name: "크래프트" })).toBeVisible();
    await expect(page.getByText("아직 공개된 크래프트가 없습니다.")).toBeVisible();
    await expect(page.locator("main article")).toHaveCount(0);
  });

  test("post detail renders rich article content and desktop toc", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/posts/nextjs-app-router-cache-strategy");

    await expect(page.locator("main")).toHaveCSS("width", "1200px");
    await expect(page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "전체 글" })).toHaveCSS("color", "rgb(78, 89, 104)");
    await expect(page.getByRole("heading", { name: "Next.js App Router 캐시 전략 정리" })).toBeVisible();
    await expect(page.locator('article header [data-post-tag="true"]').first()).toHaveCSS("font-size", "14px");
    await expect(page.locator("figcaption", { hasText: "데이터 성격에 따라 캐시 정책을 분리하는 흐름" })).toBeVisible();
    await expect(page.locator("blockquote", { hasText: "캐시 정책은 빠르게 만들기 위한 설정이 아니라" })).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator("blockquote", { hasText: "캐시 정책은 빠르게 만들기 위한 설정이 아니라" })).toHaveCSS("border-left-color", "rgb(27, 100, 218)");
    await expect(page.locator("blockquote", { hasText: "캐시 정책은 빠르게 만들기 위한 설정이 아니라" })).toHaveCSS("font-style", "italic");
    await expect(page.locator("pre")).toContainText("const cachePolicy = {");
    await expect(page.getByRole("heading", { name: "즉시 갱신이 필요한 경우" })).toBeVisible();
    await expect(page.getByRole("complementary").getByRole("link", { name: "즉시 갱신이 필요한 경우" })).toBeVisible();
    await expect(page.getByRole("complementary").locator(".bg-rail")).toHaveCount(1);
    await expect(page.getByRole("complementary").locator(".bg-rail")).toHaveCSS("height", "252px");
    await expect(page.getByRole("complementary").locator(".bg-brand")).toHaveCount(1);
    await expect(page.getByRole("complementary").getByText("목차")).toHaveCSS("font-weight", "700");
    const tocTitleBox = await page.getByRole("complementary").getByText("목차").boundingBox();
    const tocRailBox = await page.getByRole("complementary").locator(".bg-rail").boundingBox();

    expect(Math.round(tocTitleBox?.y ?? 0)).toBeLessThan(Math.round(tocRailBox?.y ?? 0));
    await expect(page.getByRole("complementary").getByRole("link", { name: "사용자 데이터 캐시" })).toHaveCSS("font-weight", "700");
    await expect(page.getByRole("complementary").getByRole("link", { name: "운영 기준 세우기" })).toHaveAttribute("aria-current", "location");
    await page.getByRole("complementary").getByRole("link", { name: "팀 규칙으로 남기기" }).click();
    await expect(page.getByRole("complementary").getByRole("link", { name: "팀 규칙으로 남기기" })).toHaveAttribute("aria-current", "location");
    await expect(page.getByRole("complementary").locator(".bg-brand")).toHaveAttribute("style", /192px/);
    await page.getByRole("heading", { name: "팀 규칙으로 남기기" }).evaluate((element) => {
      element.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await expect(page.getByRole("complementary").getByRole("link", { name: "팀 규칙으로 남기기" })).toHaveAttribute("aria-current", "location");
    await expect(page.getByRole("heading", { name: "댓글" })).toBeVisible();
    await expect(page.locator('[aria-labelledby="comments-title"] article')).toHaveCount(3);
    await expect(page.locator('[aria-labelledby="comments-title"] article').first().locator("span").first()).toHaveText("푸");
    await expect(page.locator('input[name="nickname"]')).toBeVisible();
    const nicknameInput = page.locator('input[name="nickname"]');
    const initialNickname = await nicknameInput.inputValue();

    await page.getByRole("button", { name: "랜덤 변경" }).click();
    await expect.poll(() => nicknameInput.inputValue()).not.toBe(initialNickname);
    await expect(page.getByRole("button", { name: "댓글 남기기" })).toBeDisabled();
    await page.locator('textarea[name="comment"]').fill("캐시 정책 설명이 이해하기 쉬웠어요.");
    await expect(page.getByRole("button", { name: "댓글 남기기" })).toBeEnabled();
    await page.getByRole("button", { name: "댓글 남기기" }).click();
    await expect(page.locator('textarea[name="comment"]')).toHaveValue("");
    await expect(page.locator('[aria-labelledby="comments-title"] article')).toHaveCount(4);
    await expect(page.locator('[aria-labelledby="comments-title"] article').first()).toContainText("캐시 정책 설명이 이해하기 쉬웠어요.");
    await expect(page.locator('[aria-labelledby="comments-title"] article').first()).toContainText(/\d+초 전/u);
    await expectCommentButtonsToShareSize(page);
  });

  test("post detail desktop toc adapts rail height to heading count", async ({ page }) => {
    await expectDesktopTocRailForPost(page, "nextjs-app-router-cache-strategy", "즉시 갱신이 필요한 경우", "252px");
    await expectDesktopTocRailForPost(page, "react-server-components-practical-guide", "리뷰에서 남길 질문", "252px");
    await expectDesktopTocRailForPost(page, "performance-budget-product-decisions", "홈 화면 예산", "188px");
  });

  test("post detail desktop toc indents h1 through h4 by depth", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/posts/nextjs-app-router-cache-strategy");

    const toc = page.getByRole("complementary");

    await expect(toc.getByRole("link", { name: "운영 기준 세우기" })).toHaveCSS("padding-left", "10px");
    await expect(toc.getByRole("link", { name: "캐시 전략 한눈에 보기" })).toHaveCSS("padding-left", "18px");
    await expect(toc.getByRole("link", { name: "사용자 데이터 캐시" })).toHaveCSS("padding-left", "26px");
    await expect(toc.getByRole("link", { name: "즉시 갱신이 필요한 경우" })).toHaveCSS("padding-left", "42px");
  });

  test("post detail mobile has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/posts/nextjs-app-router-cache-strategy");

    await expect(page.getByRole("heading", { name: "Next.js App Router 캐시 전략 정리" })).toBeVisible();
    await expect(page.locator("article header")).toHaveCSS("border-bottom-width", "1px");
    await expect(page.locator('[data-reading-progress-track="true"]')).toBeVisible();
    await expect(page.locator('[data-reading-progress-track="true"]')).toHaveCSS("height", "3px");
    await expect(page.locator('[data-reading-progress-track="true"]')).toHaveCSS("background-color", "rgb(229, 232, 235)");
    await expect(page.locator('[data-reading-progress-bar="true"]')).toHaveCSS("background-color", "rgb(27, 100, 218)");
    await expect.poll(() => page.locator('[data-reading-progress-bar="true"]').evaluate((element) => element.getBoundingClientRect().width)).toBeLessThan(1);
    await expect(page.locator("details")).toBeHidden();
    await expect(page.locator("figcaption", { hasText: "데이터 성격에 따라 캐시 정책을 분리하는 흐름" })).toHaveCSS("text-align", "center");
    await expect(page.locator("figcaption", { hasText: "데이터 성격에 따라 캐시 정책을 분리하는 흐름" })).toHaveCSS("width", "350px");
    await expect(page.locator('figure[data-image-width="240"] > div')).toHaveCSS("width", "240px");
    await expect(page.locator('figure[data-image-width="240"] figcaption')).toHaveCSS("width", "240px");
    await expect(page.locator("figcaption", { hasText: "작은 캐시 정책 메모" })).toHaveCSS("text-align", "center");
    await expect.poll(() => page.evaluate(() => {
      const figure = document.querySelector('figure[data-image-width="240"]');
      const image = figure?.querySelector("div");

      if (!figure || !image) {
        return false;
      }

      const figureBox = figure.getBoundingClientRect();
      const imageBox = image.getBoundingClientRect();
      const leftSpace = Math.round(imageBox.left - figureBox.left);
      const rightSpace = Math.round(figureBox.right - imageBox.right);

      return Math.abs(leftSpace - rightSpace) <= 1;
    })).toBe(true);
    await page.getByRole("heading", { name: "팀 규칙으로 남기기" }).evaluate((element) => {
      element.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await expect.poll(() => page.locator('[data-reading-progress-bar="true"]').evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(40);
    await expect(page.locator("pre")).toContainText("const cachePolicy = {");
    await expectCommentButtonsToShareSize(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("post detail tablet shows the 234px toc dropdown", async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await page.goto("/posts/nextjs-app-router-cache-strategy");

    await expectCommentButtonsToShareSize(page);
    await expect(page.locator("details")).toBeVisible();
    await expect(page.locator("details")).toHaveCSS("position", "fixed");
    await expect(page.locator("details")).toHaveCSS("width", "234px");
    await expect(page.locator("details")).toHaveCSS("display", "flex");
    await expect(page.locator('details summary span[data-state="open"]')).toHaveCSS("color", "rgb(78, 89, 104)");
    await expect(page.locator("details summary svg")).toHaveCSS("width", "10px");
    await expect(page.locator("details").getByText("읽는 중")).toHaveCount(0);
    await expect(page.locator("details").getByRole("link", { name: "운영 기준 세우기" })).toHaveCSS("background-color", "rgb(235, 243, 255)");
    await page.locator("details summary").click();
    await expect(page.locator('details summary span[data-state="closed"]')).toBeVisible();
    await page.locator("details summary").click();
    await expect(page.locator('details summary span[data-state="open"]')).toBeVisible();
    const beforeScrollBox = await page.locator("details").boundingBox();
    const tagRowBox = await page.locator("article header > div").first().boundingBox();

    expect(Math.round(beforeScrollBox?.y ?? 0)).toBe(Math.round(tagRowBox?.y ?? 0));
    await page.getByRole("heading", { name: "팀 규칙으로 남기기" }).evaluate((element) => {
      element.scrollIntoView({ behavior: "instant", block: "start" });
    });
    const afterScrollBox = await page.locator("details").boundingBox();

    expect(Math.round(afterScrollBox?.y ?? 0)).toBe(Math.round(beforeScrollBox?.y ?? 0));
    await expect(page.getByRole("complementary")).toBeHidden();
  });
});
