import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { extractMarkdownHeadings, MarkdownBody } from "@/components/post/MarkdownBody";

describe("MarkdownBody", () => {
  it("renders headings, paragraphs, image blocks, code blocks, and list blocks", () => {
    const body = [
      "# 본문 큰 제목",
      "## 캐시 전략 한눈에 보기",
      "본문 문단입니다.",
      "### 사용자 데이터 캐시",
      "> 캐시 정책은 팀의 약속입니다.",
      "#### 즉시 갱신이 필요한 경우",
      "![데이터 성격에 따라 캐시 정책을 분리하는 흐름](/images/posts/cache-strategy-flow.png \"데이터 성격에 따라 캐시 정책을 분리하는 흐름\")",
      "![작은 캐시 정책 메모](/images/posts/cache-policy-note.png \"작은 캐시 정책 메모 | width=240\")",
      "```ts\nconst cachePolicy = {\n  user: \"no-store\",\n};\n```",
      "- 공개 목록은 재검증 주기를 둡니다.",
      "- 개인화 데이터는 요청마다 새로 가져옵니다.",
    ].join("\n\n");

    const html = renderToStaticMarkup(<MarkdownBody body={body} />);

    expect(html).toContain("<h1");
    expect(html).toContain("[overflow-wrap:anywhere]");
    expect(html).toContain("본문 큰 제목</h1>");
    expect(html).toContain("text-[26px]");
    expect(html).toContain("xl:text-[28px]");
    expect(html).toContain("<h2");
    expect(html).toContain("캐시 전략 한눈에 보기</h2>");
    expect(html).toContain("<p>본문 문단입니다.</p>");
    expect(html).toContain("<h3");
    expect(html).toContain("사용자 데이터 캐시</h3>");
    expect(html).toContain("<blockquote");
    expect(html).toContain("캐시 정책은 팀의 약속입니다.");
    expect(html).toContain("<h4");
    expect(html).toContain("즉시 갱신이 필요한 경우</h4>");
    expect(html).toContain("데이터 성격에 따라 캐시 정책을 분리하는 흐름");
    expect(html).toContain("작은 캐시 정책 메모");
    expect(html).toContain("<img");
    expect(html).toContain("cache-strategy-flow.png");
    expect(html).toContain("object-contain");
    expect(html).toContain('data-image-width="240"');
    expect(html).toContain("text-center text-xs");
    expect(html).toContain("<pre");
    expect(html).toContain("[overflow-wrap:normal]");
    expect(html).not.toContain("TS</figcaption>");
    expect(html).toContain('class="language-ts"');
    expect(html).toContain('data-language="ts"');
    expect(html).toContain('class="text-brand"');
    expect(html).toContain("cachePolicy");
    expect(html).toContain("no-store");
    expect(html).toContain("<ul");
    expect(html).toContain("<li>공개 목록은 재검증 주기를 둡니다.</li>");
    expect(html).toContain("<li>개인화 데이터는 요청마다 새로 가져옵니다.</li>");
  });

  it("extracts h1 through h4 headings for the article toc", () => {
    const headings = extractMarkdownHeadings([
      "# 본문 큰 제목",
      "## 캐시 전략 한눈에 보기",
      "### 사용자 데이터 캐시",
      "#### 즉시 갱신이 필요한 경우",
    ].join("\n\n"));

    expect(headings).toEqual([
      { id: "본문-큰-제목", level: 1, text: "본문 큰 제목" },
      { id: "캐시-전략-한눈에-보기", level: 2, text: "캐시 전략 한눈에 보기" },
      { id: "사용자-데이터-캐시", level: 3, text: "사용자 데이터 캐시" },
      { id: "즉시-갱신이-필요한-경우", level: 4, text: "즉시 갱신이 필요한 경우" },
    ]);
  });
});
