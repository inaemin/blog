# 블로그 아키텍처

## 목표

Toss Tech를 벤치마킹한 정적 중심 기술 블로그를 만든다. 정적 블로그에 가깝게 유지하되, 커스텀 UI 기반의 비로그인 댓글 기능을 함께 제공한다.

우선순위는 다음과 같다.

- 정적 렌더링 중심 구조
- 낮은 운영 부담과 낮은 비용
- 현재 목업/디자인 시스템과 일치하는 UI
- 로그인 없이 작성 가능한 댓글
- 스팸과 광고 댓글이 공개 화면에 노출되지 않는 구조

## 전체 기술 스택

```txt
Next.js App Router
+ Markdown/MDX posts
+ Vercel deployment
+ Vercel Serverless Route Handlers
+ Vercel Web Analytics
+ Supabase database
+ Cloudflare Turnstile
+ AI moderation API
```

### 선택 이유

- **Next.js App Router**: 정적 페이지와 동적 API route를 같은 프로젝트에서 관리할 수 있다.
- **Markdown/MDX**: 게시글을 파일 기반으로 관리하기 쉽고, 정적 생성과 잘 맞는다.
- **Vercel**: Next.js 배포와 serverless function 운영 부담이 낮다.
- **Vercel Web Analytics**: `/posts/[slug]` page view를 기반으로 인기 글을 자동 산정할 수 있다.
- **Supabase**: 댓글처럼 동적으로 변하는 데이터를 저장하기 좋고, 개인 블로그 규모에서는 무료 tier로 시작하기 쉽다.
- **Turnstile + AI moderation**: 로그인 없는 댓글에서 bot/스팸/광고를 줄이는 방어막으로 사용한다.

## 페이지 Route 구조

```txt
/
/posts
/posts/[slug]
/craft
/tags/[tag]
/rss.xml
/sitemap.xml
```

### Route 역할

- `/`: 홈. 최신 글, 인기 글, 최신 댓글 등 블로그의 주요 진입점.
- `/posts`: 전체 글 목록.
- `/posts/[slug]`: 개별 글 상세 페이지.
- `/craft`: 별도 craft 섹션. 글과는 다른 성격의 작업물이나 실험을 모아두는 영역.
- `/tags/[tag]`: 태그별 글 목록.
- `/rss.xml`: RSS 구독용 feed.
- `/sitemap.xml`: 검색엔진 색인을 위한 sitemap.

## 정적 데이터와 동적 데이터 분리

이 블로그는 기본적으로 정적 블로그에 가깝게 만든다.

정적으로 다루는 데이터:

```txt
공개 게시글 본문
공개 게시글 제목/설명/태그/작성일
craft 콘텐츠
태그 목록
RSS / sitemap
```

게시글과 craft 콘텐츠는 `draft`, `published`, `private` 상태를 가진다. 공개 목록, RSS, sitemap에는 `published` 콘텐츠만 포함한다.

동적으로 다루는 데이터:

```txt
댓글 목록
댓글 작성 요청
댓글 moderation 상태
스팸 방어 결과
인기 글 집계 결과
```

게시글과 페이지는 가능한 빌드 시점에 생성한다. 댓글 데이터와 인기 글 집계 결과는 정적 빌드에 직접 포함하지 않고, API route 또는 캐시된 데이터로 런타임에 조회한다.

## 인기 글 산정 방식

인기 글은 운영자가 직접 고정하는 수동 목록보다, 실제 조회 데이터를 기반으로 자동 산정하는 쪽을 우선한다.

기본 기준:

```txt
최근 30일 /posts/[slug] page views
```

처리 흐름:

```txt
Vercel Web Analytics API
→ 최근 30일 requestPath별 page view 조회
→ /posts/[slug] 경로만 필터링
→ page view 기준으로 인기 글 순위 계산
→ 홈/글 목록의 인기 글 섹션에 표시
```

초기 점수는 단순 page view 기준으로 시작한다.

```txt
popularScore = recentPageViews
```

댓글 수까지 반영하고 싶어지면 이후에 점수를 확장한다.

```txt
popularScore = recentPageViews + approvedCommentCount * 5
```

초기 구현은 `/api/popular-posts` Route Handler에서 Vercel Web Analytics API를 서버 사이드로 직접 조회한다. Vercel API token이 필요하므로 클라이언트에서는 직접 호출하지 않는다.

추후 캐싱 전략:

```txt
트래픽 증가 또는 API 한도 문제가 생기면 Vercel Cron 또는 GitHub Actions scheduled workflow에서 집계
→ Supabase popular_posts 같은 캐시 저장소에 저장
```

인기 글 API가 Analytics API 조회에 실패하거나 필요한 환경 변수가 없으면 공개 글 목록 기반 fallback을 반환한다.

## 댓글 시스템의 큰 흐름

댓글 기능은 별도 백엔드 서버를 운영하지 않고, Vercel Serverless Route Handler로 처리한다.

```txt
사용자가 댓글 제출
→ POST /api/comments
→ 기본 요청 검증
→ 스팸 방어 검사
→ AI moderation
→ Supabase 저장
→ 결과 반환
```

댓글 조회는 공개 가능한 댓글만 반환한다.

```txt
GET /api/comments?postSlug=...
→ Supabase에서 approved 댓글만 조회
→ 클라이언트에 반환
```

핵심 원칙:

```txt
익명 제출은 허용한다.
모든 익명 댓글의 즉시 공개를 보장하지 않는다.
공개 화면에는 approved 댓글만 렌더링한다.
```

댓글 UX/API/DB schema/status 상세는 [`comment-system.md`](../comments/comment-system.md)에 정리한다.

## DB 선택 이유

댓글은 정적 파일이나 GitHub commit 방식이 아니라 DB에 저장한다.

Supabase를 우선 선택하는 이유:

- 댓글은 작성/조회/숨김/삭제/상태 변경이 필요한 동적 데이터다.
- `approved`, `pending`, `spam`, `rejected` 같은 상태 관리가 필요하다.
- 운영 초기에는 Supabase table/editor만으로도 간단한 관리자 workflow를 만들 수 있다.
- 개인 블로그 규모에서는 무료 tier로 시작하기 좋다.
- 추후 관리자 페이지, 댓글 검색, 신고, 차단 기능으로 확장하기 쉽다.

GitHub repo commit 방식은 승인제나 저빈도 기록용으로는 가능하지만, 누구나 작성 가능한 즉시성 댓글 저장소로는 적합하지 않다. Discord도 알림/로그 용도로는 쓸 수 있지만 댓글 DB로 쓰기에는 검색, 정렬, 삭제, 정책 리스크가 크다.

## 스팸 방어 전략 개요

비로그인 댓글은 반드시 여러 겹의 방어가 필요하다.

```txt
Honeypot
+ Rate limit
+ Turnstile
+ AI moderation
+ approved-only public reads
```

각 레이어의 역할:

- **Honeypot**: 단순 bot이 숨겨진 field를 채우는지 확인한다.
- **Rate limit**: 같은 IP/session에서 짧은 시간에 반복 제출하는 것을 제한한다.
- **Turnstile**: bot/자동화 요청을 줄인다.
- **AI moderation**: 댓글 내용을 분류해 공개 가능 여부를 판단한다.
- **approved-only public reads**: 통과한 댓글만 공개 화면에 보여준다.

AI prompt, allow/review/reject 기준, 스팸 정책 상세는 [`moderation-policy.md`](../comments/moderation-policy.md)에 정리한다.

## 운영과 비용 관점의 큰 결정

### 운영 방식

- 별도 VPS나 항상 켜져 있는 백엔드 서버를 운영하지 않는다.
- Vercel serverless function으로 댓글 API를 처리한다.
- 초기 관리자 기능은 Supabase table/editor workflow로 시작할 수 있다.
- 댓글이 많아지면 별도 admin UI를 만든다.

### 비용 관점

개인 기술 블로그 규모라면 Vercel serverless 사용량은 보통 무료 Hobby plan 범위 안에 들어갈 가능성이 높다.

계획 시점 기준 Vercel 무료 tier 형태:

```txt
Vercel Functions / Fluid Compute Hobby allowance:
- 월 약 1,000,000 invocations
- 월 약 4시간 active CPU
- 월 약 360 GB-hours provisioned memory

Vercel Web Analytics Hobby allowance:
- 월 약 50,000 events
- reporting window 약 1개월
```

비용이 발생할 가능성이 큰 부분은 다음이다.

- AI moderation API 호출
- Supabase database 사용량
- 선택적인 rate-limit storage
- Vercel Web Analytics event 한도 초과

비용을 줄이기 위해 검사는 저렴한 것부터 비싼 것 순서로 배치한다.

```txt
입력값 검증
→ honeypot
→ rate limit
→ Turnstile
→ AI moderation
→ database write
```

인기 글 산정을 위한 Vercel Web Analytics API 호출은 클라이언트에서 직접 하지 않는다. Vercel access token은 serverless function, cron, build/revalidate 작업처럼 서버 쪽에서만 사용한다.

## Toss Tech 벤치마킹 메모

Toss Tech에서 공개적으로 관찰되는 동작은 다음과 같다.

- 비로그인 댓글
- 랜덤 닉네임
- 최신 댓글이 닉네임/아바타 형태로 표시됨
- 부적절한 댓글, 허위사실, 사칭 댓글 등이 고지 없이 삭제될 수 있다는 안내
- API endpoint를 통한 공개 댓글 조회

정확한 내부 백엔드와 moderation 프로세스는 공개 정보만으로 검증할 수 없다.

가장 안전한 추정은 다음과 같다.

```txt
Toss는 guest comment submission을 허용하지만,
공개 노출은 filtering 또는 운영자 moderation으로 통제할 가능성이 높다.
```

이 블로그도 같은 원칙을 따른다.

## 관련 문서

- [`comment-system.md`](../comments/comment-system.md): 댓글 UX, API 흐름, DB schema, moderation 상태
- [`moderation-policy.md`](../comments/moderation-policy.md): AI prompt, allow/review/reject 기준, 스팸 정책
