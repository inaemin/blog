# 인프라 아키텍처

## 목표

정적 중심 Next.js 블로그를 Vercel에 배포하고, 동적 기능은 최소한의 serverless/API 조합으로 처리한다.

핵심 원칙:

- 블로그 본문과 태그 페이지는 가능한 정적으로 제공한다.
- 댓글, moderation, 인기 글 집계는 serverless route에서 처리한다.
- 별도 VPS나 항상 켜져 있는 백엔드 서버는 운영하지 않는다.
- 민감한 API key는 클라이언트에 노출하지 않는다.

## 전체 인프라 구성

```mermaid
flowchart TB
  User[사용자 브라우저]

  subgraph Vercel[Vercel]
    Edge[Vercel Edge / CDN]
    NextApp[Next.js App Router]
    StaticPages[정적 페이지\n홈 / 글 / 태그 / craft / RSS / sitemap]
    ApiComments[Route Handler\n/api/comments]
    ApiPopular[Route Handler\n/api/popular-posts]
    WebAnalytics[Vercel Web Analytics]
  end

  subgraph Supabase[Supabase]
    CommentsTable[(comments table)]
  end

  Turnstile[Cloudflare Turnstile\nSiteverify]
  AI[AI Moderation API]

  User --> Edge
  Edge --> NextApp
  NextApp --> StaticPages

  User -->|댓글 조회/작성| ApiComments
  ApiComments -->|approved 댓글 조회| CommentsTable
  ApiComments -->|댓글 저장| CommentsTable
  ApiComments -->|token 검증| Turnstile
  ApiComments -->|댓글 분류| AI

  User -->|인기 글 조회| ApiPopular
  ApiPopular -->|최근 30일 page view 조회| WebAnalytics

  User -->|page view 수집| WebAnalytics
```

## 정적 페이지 제공 흐름

```mermaid
sequenceDiagram
  participant U as 사용자
  participant E as Vercel Edge/CDN
  participant N as Next.js App Router

  U->>E: 페이지 요청
  E->>N: 정적 페이지 또는 ISR 캐시 조회
  N-->>E: HTML/RSC payload 반환
  E-->>U: 페이지 응답
```

정적으로 제공하는 대상:

```txt
/
/posts
/posts/[slug]
/craft
/tags/[tag]
/rss.xml
/sitemap.xml
```

`/tags/[tag]`는 API 없이 MDX frontmatter의 `tags`를 빌드 시점에 수집해 생성한다.

## 댓글 작성 흐름

```mermaid
sequenceDiagram
  participant U as 사용자
  participant C as CommentComposer
  participant A as /api/comments
  participant T as Cloudflare Turnstile
  participant M as AI Moderation API
  participant S as Supabase comments

  U->>C: 댓글 입력
  C->>A: POST /api/comments
  A->>A: 입력값 검증 / honeypot / rate limit
  A->>T: Turnstile token 검증
  T-->>A: success/failure
  A->>M: 댓글 내용 moderation
  M-->>A: allow / needs_review / reject
  A->>A: decision을 status로 변환
  A->>S: 댓글 저장
  S-->>A: 저장 완료
  A-->>C: ok + status 반환
  C-->>U: 제출 결과 표시
```

댓글 상태 매핑:

```txt
allow        → approved
needs_review → pending
reject       → spam 또는 rejected
```

공개 화면에는 `approved` 댓글만 노출한다.

## 댓글 조회 흐름

```mermaid
sequenceDiagram
  participant U as 사용자
  participant L as CommentList
  participant A as /api/comments
  participant S as Supabase comments

  U->>L: 글 상세 페이지 진입
  L->>A: GET /api/comments?postSlug=...
  A->>S: approved + hidden=false + deleted_at is null 조회
  S-->>A: 공개 댓글 목록
  A-->>L: public comment response
  L-->>U: 댓글 목록 렌더링
```

public response에는 내부 필드를 포함하지 않는다.

제외 필드:

```txt
moderation_result
ip_hash
user_agent_hash
hidden
deleted_at
```

## 인기 글 집계 흐름

```mermaid
sequenceDiagram
  participant A as Vercel Web Analytics API
  participant P as /api/popular-posts
  participant U as 사용자

  U->>P: GET /api/popular-posts
  P->>A: 최근 30일 /posts/* page view 조회
  A-->>P: requestPath별 page view 집계 결과
  P->>P: published 글과 매칭 후 score/rank 계산
  P-->>U: 인기 글 응답
```

초기 기준:

```txt
popularScore = recentPageViews
```

추후 확장:

```txt
popularScore = recentPageViews + approvedCommentCount * 5
```

추후 캐싱 전략:

```txt
트래픽 증가 또는 API 한도 문제가 생기면 Vercel Cron 하루 1회 집계
필요 시 GitHub Actions scheduled workflow로 batch job 이동
```

현재 구현은 Supabase 캐시 테이블 없이 Route Handler에서 직접 조회한다. 환경 변수가 없거나 Analytics API 조회가 실패하면 published 글 목록 기반 fallback을 반환한다.

## 데이터 저장소

### Supabase `comments`

역할:

- 댓글 저장
- moderation 상태 관리
- 숨김/삭제 상태 관리

주요 상태:

```txt
pending
approved
spam
rejected
```

## 환경 변수

서버 전용:

```txt
TURNSTILE_SECRET_KEY
SUPABASE_SECRET_KEY
AI_API_KEY
VERCEL_ACCESS_TOKEN
VERCEL_PROJECT_ID
VERCEL_TEAM_ID
```

GitHub Actions를 스케줄러로 추가할 경우, 다음 값은 GitHub Repository Secrets에도 등록한다.

```txt
SUPABASE_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
VERCEL_ACCESS_TOKEN
VERCEL_PROJECT_ID
VERCEL_TEAM_ID
```

클라이언트 노출 가능:

```txt
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_TURNSTILE_SITE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

주의:

- `SUPABASE_SECRET_KEY`는 클라이언트에 노출하지 않는다.
- `TURNSTILE_SECRET_KEY`는 클라이언트에 노출하지 않는다.
- `AI_API_KEY`는 클라이언트에 노출하지 않는다.
- `VERCEL_ACCESS_TOKEN`은 Route Handler, cron, build, GitHub Actions 같은 서버 쪽 작업에서만 사용한다.
- `VERCEL_TEAM_ID`는 팀 프로젝트에서 Vercel Web Analytics API를 조회할 때 사용하며, 개인 프로젝트에서는 생략할 수 있다.

## 배포 구성

```mermaid
flowchart LR
  Git[Git Repository]
  VercelBuild[Vercel Build]
  Deploy[Vercel Production Deployment]
  Env[Vercel Environment Variables]
  Supabase[Supabase Project]

  Git --> VercelBuild
  Env --> VercelBuild
  VercelBuild --> Deploy
  Deploy --> Supabase
```

배포 전 확인:

- Vercel 프로젝트 생성
- Supabase 프로젝트 생성
- Vercel Web Analytics 활성화
- Turnstile site/secret key 발급
- AI moderation API key 설정
- 환경 변수 등록

## 운영 메모

- 댓글 관리는 초기에는 Supabase table/editor에서 처리한다.
- 별도 admin UI는 댓글이 많아진 뒤 만든다.
- 인기 글은 초기에는 `/api/popular-posts`에서 Vercel Web Analytics API를 직접 조회한다.
- 트래픽 증가 또는 API 한도 문제가 생기면 scheduler와 캐시 저장소를 추가한다.
- 댓글 또는 인기 글 API가 실패해도 전체 페이지 렌더링은 깨지지 않아야 한다.
