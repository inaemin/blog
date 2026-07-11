# Annie Way

프론트엔드 개발과 제품 경험을 기록하는 Next.js 기반 기술 블로그입니다.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase 댓글 API
- Vitest, Playwright

## Getting Started

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Environment Variables

로컬 환경 변수는 `.env.example`을 참고해 `.env.local`에 설정합니다.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_server_only_key
VERCEL_ACCESS_TOKEN=your_vercel_access_token
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TEAM_ID=your_vercel_team_id
```

선택 기능:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`: 댓글 스팸 방지
- `AI_API_KEY`: 댓글 AI 모더레이션
- `VERCEL_ACCESS_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`: Vercel Web Analytics 기반 인기 글 정렬
- `VERCEL_TEAM_ID`: 팀 프로젝트가 아니면 생략 가능

Vercel 값 확인 방법:

- `VERCEL_ACCESS_TOKEN`: Vercel Dashboard → Account Settings → Tokens에서 생성
- `VERCEL_PROJECT_ID`: `.vercel/repo.json`의 `projects[].id` 또는 Vercel 프로젝트 ID
- `VERCEL_TEAM_ID`: `.vercel/repo.json`의 `projects[].orgId`; 개인 프로젝트면 생략 가능

Vercel Analytics 환경 변수가 없거나 API 조회에 실패하면 `/api/popular-posts`는 공개 글 목록 기반 fallback을 반환합니다.

## Scripts

```bash
pnpm dev        # 개발 서버 실행
pnpm lint       # ESLint 검사
pnpm test:unit  # Vitest 단위 테스트
pnpm test:e2e   # fixture 모드로 빌드 후 Playwright E2E 실행
pnpm check      # lint, unit test, production build 검증
pnpm build      # production build
pnpm start      # production server 실행
```

## Project Structure

- `app/`: App Router 페이지와 API 라우트
- `components/`: 레이아웃, 게시글, 댓글, 홈 섹션 컴포넌트
- `content/posts/`: MDX 게시글 콘텐츠
- `lib/`: 콘텐츠 로더, 댓글, 인기 글, 사이트 설정 유틸
- `tests/`: unit/e2e 테스트
- `docs/`: API, 아키텍처, 콘텐츠, 디자인 문서

## Content Visibility

게시글 frontmatter의 `status` 값으로 노출 범위를 제어합니다.

- `published`: 공개 목록, 태그, RSS, sitemap, 인기 글 대상
- `private`: public 화면/API에서 제외, 개발 preview에서만 확인
- `draft`: public 화면/API에서 제외, 개발 preview에서만 확인

## Deployment

Vercel 배포를 기준으로 합니다. 배포 환경에는 최소한 다음 값을 설정합니다.

```bash
NEXT_PUBLIC_SITE_URL=https://your-blog.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_server_only_key
```

Vercel Web Analytics 기반 인기 글 정렬까지 사용하려면 다음 값도 등록합니다.

```bash
VERCEL_ACCESS_TOKEN=your_vercel_access_token
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TEAM_ID=your_vercel_team_id
```

팀 프로젝트가 아니면 `VERCEL_TEAM_ID`는 생략할 수 있습니다.
