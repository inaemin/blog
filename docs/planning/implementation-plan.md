# 구현 계획

## 목적

`design/blog-draft/blog-draft.pen` 목업을 Next.js 16 App Router 기반의 정적 중심 기술 블로그로 구현하기 위한 실행 순서와 검증 항목을 정리한다.

이 문서는 세부 설계의 원본이 아니라 구현을 진행하기 위한 로드맵이다. 상세 결정은 아래 문서를 기준으로 한다.

## 문서 지도

- [`architecture.md`](../architecture/architecture.md): 전체 기술 스택, route 구조, 정적/동적 데이터 분리, 댓글/인기 글/운영 방향
- [`project-structure.md`](../project/project-structure.md): App Router 파일 구조, component/lib 구조, Server/Client Component 경계, MDX 렌더링 파이프라인
- [`content-model.md`](../content/content-model.md): MDX frontmatter schema, `status` 규칙, route별 콘텐츠 생성 규칙, pagination/fallback
- [`api-contracts.md`](../api/api-contracts.md): 댓글/인기 글 API 요청·응답 형식과 error code
- [`comment-system.md`](../comments/comment-system.md): 댓글 UX, API 흐름, Supabase schema, moderation 상태, 관리자 운영
- [`moderation-policy.md`](../comments/moderation-policy.md): honeypot/rate limit/Turnstile/AI moderation 정책과 prompt 기준
- [`infra.md`](../architecture/infra.md): Vercel, Supabase, Analytics, scheduler, 환경 변수, Mermaid 인프라 구성
- [`design-system.md`](../design/design-system.md): 목업 기반 UI 규칙, 색상/타이포그래피/컴포넌트 표현 기준

## 구현 우선순위

1. 프로젝트 기반과 디자인 시스템을 먼저 만든다.
2. MDX 콘텐츠 모델과 정적 route를 완성한다.
3. 댓글 없이도 동작하는 블로그 화면을 먼저 배포 가능한 상태로 만든다.
4. 댓글 조회/작성 API와 Supabase 저장소를 연결한다.
5. honeypot, rate limit, Turnstile, AI moderation을 순서대로 붙인다.
6. Vercel Web Analytics 기반 인기 글 집계와 fallback을 추가한다.
7. 운영/관리 workflow와 배포 검증을 보강한다.

## 구현 단계 체크리스트

### 1단계: 프로젝트 기반

- [ ] Next.js 16 App Router 프로젝트 생성
- [ ] Tailwind CSS 설정
- [ ] `design/blog-draft/blog-draft.pen`과 [`design-system.md`](../design/design-system.md)의 디자인 토큰 반영
- [ ] [`design-system.md`](../design/design-system.md)의 implementation breakpoint, reference frame width, responsive scale 반영
- [ ] 주요 responsive 전환 기준을 Mobile `base, <768`, Tablet `md, >=768`, Desktop `xl, >=1280`으로 적용
- [ ] 공통 `layout`, `Header`, `Footer`, `PageShell` 구현
- [ ] [`project-structure.md`](../project/project-structure.md)에 맞춰 `app/`, `components/`, `lib/`, `content/` 디렉터리 구성
- [ ] Server Component / Client Component 경계 적용
- [ ] `MobileMenu`, `TableOfContents`, `CommentComposer`, `TurnstileWidget`처럼 상호작용이 필요한 leaf component에만 `"use client"` 적용

### 2단계: 정적 콘텐츠와 MDX

- [ ] `@next/mdx` 기반 MDX 렌더링 설정
- [ ] `next.config.mjs`에 `.mdx` page extension 설정
- [ ] `mdx-components.tsx`에 본문 typography/component mapping 추가
- [ ] `lib/mdx.ts`에 MDX/frontmatter 로딩, 파싱, 정렬, slug 매핑 로직 구현
- [ ] [`content-model.md`](../content/content-model.md)의 `PostFrontmatter`, `CraftFrontmatter` 검증 로직 구현
- [ ] `status: 'draft' | 'published' | 'private'` 처리 규칙 적용
- [ ] 홈, 전체 글 목록, 글 상세, craft, tag 페이지 구현
- [ ] RSS와 sitemap 생성

### 3단계: 댓글 없는 블로그 완성

- [ ] 홈의 최신 글/인기 글/최신 댓글 section 레이아웃 구현
- [ ] 글 상세의 header, 본문, TOC, 댓글 영역 placeholder 구현
- [ ] `/craft` 목록 구현
- [ ] `/tags/[tag]` 정적 생성 구현
- [ ] 인기 글 cache가 없을 때 최신 `published` 글을 보여주는 fallback 적용
- [ ] 댓글/인기 글 네트워크 실패 시 전체 페이지가 깨지지 않도록 fallback UI 적용
- [ ] Mobile `base, <768`, Tablet `md, >=768`, Desktop `xl, >=1280`에서 홈/목록/상세/craft/tag 레이아웃 확인

### 4단계: 댓글 시스템

- [ ] Supabase `comments` table 구성
- [ ] `GET /api/comments` 구현
- [ ] `CommentList` 연결
- [ ] `CommentComposer` UI 구현
- [ ] `POST /api/comments` 구현
- [ ] `approved` 댓글만 public response에 포함
- [ ] 내부 필드(`moderation_result`, `ip_hash`, `user_agent_hash`, `hidden`, `deleted_at`)는 public response에서 제외
- [ ] 초기 관리자 운영은 Supabase table/editor에서 처리

### 5단계: 스팸 방어와 moderation

- [ ] honeypot hidden field 추가
- [ ] IP 또는 hashed identifier 기반 rate limit 추가
- [ ] `TurnstileWidget`에서 token 발급
- [ ] `/api/comments`에서 Cloudflare Siteverify로 Turnstile token 서버 검증
- [ ] AI moderation 호출 추가
- [ ] AI 결과에 따라 `approved`, `pending`, `rejected`, `spam` 상태 저장
- [ ] 사용자에게 내부 moderation 사유나 민감한 error detail을 노출하지 않음

### 6단계: 인기 글 집계

- [ ] 최근 30일 `/posts/[slug]` page views 기준으로 인기 글 산정
- [ ] Vercel Web Analytics API에서 path별 page view 조회
- [ ] `GET /api/popular-posts` 구현
- [ ] 초기에는 Route Handler에서 직접 조회하고, 필요 시 Supabase 캐시와 scheduler를 추가
- [ ] 캐시가 없거나 API 실패 시 최신 `published` 글 fallback 사용

### 7단계: 배포와 운영 검증

- [ ] Vercel Preview Deploy 확인
- [ ] Vercel Web Analytics 활성화
- [ ] Supabase 연결 확인
- [ ] 필수/선택 환경 변수 등록
- [ ] 댓글 작성/조회 end-to-end 테스트
- [ ] `approved`, `pending`, `rejected`, `spam` 상태별 노출 테스트
- [ ] Turnstile 실패, rate limit, moderation 실패 case 테스트
- [ ] RSS와 sitemap 출력 확인
- [ ] 인기 글 집계와 fallback 동작 확인
- [ ] 모바일 메뉴, TOC, 댓글 작성 등 Client Component 상호작용 확인
- [ ] Breakpoint boundary `767`, `768`, `1279`, `1280`에서 반응형 전환 검수
- [ ] `sm`/`lg` 전용 스타일을 추가했다면 `639`, `640`, `1023`, `1024`에서도 추가 검수
- [ ] Mobile `390`, Tablet `834`, Desktop `1440` reference frame width에서 목업 기준 UI 검수

## 완료 기준

- 정적 콘텐츠만으로도 블로그가 배포 가능한 상태여야 한다.
- `draft`와 `private` 콘텐츠는 production 목록, RSS, sitemap, 상세 페이지에서 노출되지 않아야 한다.
- 댓글은 비로그인으로 작성할 수 있지만 공개 조회는 `approved` 상태만 가능해야 한다.
- 스팸 방어는 honeypot, rate limit, Turnstile, AI moderation을 서버 검증 흐름 안에서 처리해야 한다.
- 인기 글 집계 실패가 홈 화면 전체 장애로 이어지지 않아야 한다.
- Breakpoint boundary와 Mobile/Tablet/Desktop reference frame width에서 레이아웃이 깨지지 않아야 한다.
- 상세 설계가 필요할 때는 이 문서에 중복 작성하지 않고 문서 지도에 있는 원본 문서를 갱신해야 한다.
