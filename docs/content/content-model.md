# 콘텐츠 모델

## 목적

MDX 기반 게시글과 craft 콘텐츠의 route, frontmatter schema, 공개 상태, 목록/태그/RSS/sitemap 생성 규칙을 정리한다. 로컬 개발 환경(`NODE_ENV=development`)에서는 작성 중인 콘텐츠를 미리 확인할 수 있고, 프로덕션 빌드/배포에서는 공개 콘텐츠만 노출한다.

관련 문서:

- [`architecture.md`](../architecture/architecture.md)
- [`project-structure.md`](../project/project-structure.md)
- [`implementation-plan.md`](../planning/implementation-plan.md)

## Route별 구현 결정

### `/`

홈 페이지.

포함 섹션:

- 최신 글
- 인기 있는 글
- 최신 댓글

데이터 기준:

- 최신 글: 환경별 노출 대상 MDX 글을 `publishedAt` 내림차순으로 정렬하고 최대 5개 표시
- 인기 있는 글: Vercel Web Analytics의 최근 30일 `/posts/*` pageviews 기반 정렬, 조회 실패 시 공개 글 fallback
- 최신 댓글: Supabase의 `approved` 댓글 중 최신순

### `/posts`

전체 글 목록 페이지.

기본 정렬:

```txt
status = published
→ publishedAt desc
```

초기 pagination:

```txt
페이지당 10개
```

글 수가 적을 때는 pagination 없이 전체 목록을 보여줄 수 있다.

### `/posts/[slug]`

개별 글 상세 페이지.

정적 생성:

```txt
generateStaticParams로 모든 post slug 생성
```

포함 섹션:

- 글 header
- 글 본문
- TOC
- 댓글 목록
- 댓글 작성 composer

댓글은 정적 빌드에 포함하지 않고 client/API를 통해 조회한다.

### `/craft`

글과 다른 성격의 작업물, 실험, 짧은 기록을 모아두는 페이지.

초기 구현은 정적 목록으로 시작한다.

필요하면 이후 `/craft/[slug]`를 추가한다.

### `/tags/[tag]`

태그별 글 목록 페이지.

API 없이 정적으로 생성한다.

```txt
MDX frontmatter에서 tags 수집
→ 모든 tag에 대해 generateStaticParams 생성
→ 해당 tag가 포함된 글 목록 렌더링
```

### `/rss.xml`

RSS 구독용 feed.

최신 글 기준으로 생성한다.

### `/sitemap.xml`

검색엔진 색인을 위한 sitemap.

포함 대상:

- `/`
- `/posts`
- `/posts/[slug]`
- `/craft`
- `/tags/[tag]`

## MDX Frontmatter Schema

게시글 frontmatter 최소 필드:

```ts
type PostFrontmatter = {
  title: string;
  description: string;
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
  tags: string[];
  readingTime: string;
  status: "draft" | "published" | "private";
  thumbnail?: string;
};
```

`status` 의미:

```txt
draft     → 작성 중인 임시글
published → 공개 글
private   → 작성은 완료됐지만 공개하지 않는 글
```

처리 규칙:

```txt
published
→ 목록 표시
→ 상세 페이지 생성
→ RSS 포함
→ sitemap 포함

draft
→ development 목록 표시
→ development 상세 페이지 접근 가능
→ RSS 제외
→ sitemap 제외
→ production 상세 접근 404

private
→ development 목록 표시
→ development 상세 페이지 접근 가능
→ RSS 제외
→ sitemap 제외
→ production 상세 접근 404 또는 preview 전용
```

예시:

```md
---
title: "Next.js App Router 캐시 전략 정리"
description: "데이터 성격에 따라 no-store, revalidate, on-demand 갱신을 나누는 기준을 정리합니다."
publishedAt: "2026-07-09"
slug: "nextjs-app-router-cache-strategy"
tags: ["Next.js", "Caching"]
readingTime: "4분 읽기"
status: "published"
---
```

Craft content schema:

```ts
type CraftFrontmatter = {
  title: string;
  description: string;
  publishedAt?: string;
  slug: string;
  status: "draft" | "published" | "private";
  tags?: string[];
  thumbnail?: string;
  externalUrl?: string;
};
```

Craft도 post와 같은 status 규칙을 사용한다.

## Pagination / Fallback

### 전체 글 목록

초기 기준:

```txt
페이지당 10개
```

글 수가 적으면 pagination 없이 전체 표시한다.

### 댓글

초기 기준:

```txt
최신순 또는 오래된순 중 하나를 선택
초기 로딩 20개
더보기 버튼으로 추가 로딩
```

권장:

```txt
오래된순 정렬
초기 20개
```

### 인기 글

캐시가 없을 때:

```txt
최신 published 글
```

### 네트워크 실패 UI

댓글 또는 인기 글 조회 실패 시 전체 페이지를 깨뜨리지 않는다.

```txt
댓글을 불러오지 못했습니다.
잠시 후 다시 시도해주세요.
```
