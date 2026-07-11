# 프로젝트 구조

## 목적

Next.js 16 App Router 기반 블로그의 파일 구조, 컴포넌트 배치, Server/Client Component 경계, MDX 렌더링 파이프라인을 정리한다.

관련 문서:

- [`implementation-plan.md`](../planning/implementation-plan.md)
- [`content-model.md`](../content/content-model.md)
- [`design-system.md`](../design/design-system.md)

## 초기 파일 구조

```txt
next.config.mjs
mdx-components.tsx

app/
  layout.tsx
  page.tsx
  posts/
    page.tsx
    [slug]/
      page.tsx
  craft/
    page.tsx
  tags/
    [tag]/
      page.tsx
  rss.xml/
    route.ts
  sitemap.xml/
    route.ts
  api/
    comments/
      route.ts
    popular-posts/
      route.ts

content/
  posts/
    *.mdx
  craft/
    *.mdx
```

`app/`은 URL route와 화면 렌더링을 담당한다. 실제 글 원본 MDX 파일은 `content/`에 둔다.

```txt
app/posts/[slug]/page.tsx
→ content/posts/*.mdx를 읽어 글 상세 페이지로 렌더링

app/craft/page.tsx
→ content/craft/*.mdx를 읽어 craft 목록으로 렌더링
```

## 권장 Component 구조

```txt
components/
  layout/
    Header.tsx
    MobileMenu.tsx
    Footer.tsx
    PageShell.tsx
  post/
    PostList.tsx
    PostListItem.tsx
    PostHeader.tsx
    PostBody.tsx
    TableOfContents.tsx
  home/
    LatestPostsSection.tsx
    PopularPostsSection.tsx
    LatestCommentsSection.tsx
  comments/
    CommentList.tsx
    CommentItem.tsx
    CommentComposer.tsx
    TurnstileWidget.tsx
  tags/
    TagChip.tsx
    TagPostList.tsx
```

## 권장 Lib 구조

```txt
lib/
  mdx.ts
  posts.ts
  tags.ts
  rss.ts
  sitemap.ts
  comments.ts
  moderation.ts
  popular-posts.ts
  supabase.ts
  rate-limit.ts
  turnstile.ts
```

## Server Component / Client Component 경계

기본 원칙:

```txt
데이터 읽기 / 정적 렌더링 / MDX 렌더링
→ Server Component

사용자 입력 / 클릭 / 상태 / effect / 브라우저 API
→ Client Component + "use client"
```

App Router의 `page.tsx`, `layout.tsx`는 기본적으로 Server Component로 둔다. 필요한 상호작용만 작은 Client Component로 분리한다.

Server Component로 유지할 대상:

```txt
app/page.tsx
app/posts/page.tsx
app/posts/[slug]/page.tsx
app/craft/page.tsx
app/tags/[tag]/page.tsx
PostList
PostListItem
PostHeader
PostBody
LatestPostsSection
PopularPostsSection
LatestCommentsSection
Footer
MDX 본문 렌더링
```

`"use client"`가 필요한 대상:

```txt
CommentComposer
→ textarea 상태, submit handler, 에러/성공 메시지, Turnstile token 관리

TurnstileWidget
→ Cloudflare Turnstile browser widget 렌더링과 token callback 처리

CommentList
→ 클라이언트에서 댓글을 fetch하거나 더보기/새로고침 상태가 있으면 필요

TableOfContents
→ scroll 위치 감지, active heading 계산, floating/dropdown 제어가 있으면 필요

MobileMenu
→ 모바일 메뉴 열기/닫기 상태와 클릭 이벤트 처리

Tag filter UI
→ 페이지 이동 없이 클라이언트에서 선택/필터링 상태를 관리하면 필요
```

예시:

```tsx
'use client'

import { useState } from 'react'

export function CommentComposer() {
  const [body, setBody] = useState('')

  return <textarea value={body} onChange={(event) => setBody(event.target.value)} />
}
```

주의:

- Client Component에 전달하는 props는 직렬화 가능한 값이어야 한다.
- Server Component에서 읽은 데이터는 필요한 값만 Client Component로 넘긴다.
- 전체 페이지를 `"use client"`로 만들지 않는다.
- 상호작용이 필요한 가장 작은 컴포넌트에만 `"use client"`를 붙인다.

## MDX 렌더링 파이프라인

`content/**/*.mdx` 파일을 React 페이지로 렌더링하기 위한 MDX 설정이 필요하다.

필요 패키지:

```txt
@next/mdx
@mdx-js/loader
@mdx-js/react
@types/mdx
```

핵심 파일:

```txt
next.config.mjs
→ Next.js가 .mdx 파일을 import/render 할 수 있게 설정

mdx-components.tsx
→ MDX 기본 HTML 요소를 커스텀 컴포넌트로 매핑

lib/mdx.ts
→ MDX/frontmatter 로딩, 파싱, 정렬, slug 매핑 공통 로직
```

Next.js MDX 설정 예시:

```js
import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  // remarkPlugins, rehypePlugins 등을 추가할 수 있다.
})

export default withMDX(nextConfig)
```

`mdx-components.tsx` 예시:

```tsx
import type { MDXComponents } from 'mdx/types'

const components: MDXComponents = {
  h2: (props) => <h2 className="mt-10 text-xl font-semibold" {...props} />,
  p: (props) => <p className="leading-7 text-slate-700" {...props} />,
  a: (props) => <a className="text-blue-600 underline" {...props} />,
  code: (props) => <code className="rounded bg-slate-100 px-1" {...props} />,
}

export function useMDXComponents(): MDXComponents {
  return components
}
```

커스텀 가능한 것:

- `h1`, `h2`, `h3`, `p`, `ul`, `ol`, `blockquote`, `a`, `code`, `pre`, `img` 스타일
- 코드 블록 syntax highlighting
- heading anchor link
- table 스타일
- 이미지 caption
- 커스텀 callout 컴포넌트
- 글 안에서 사용하는 React 컴포넌트

즉, MDX 본문도 디자인 시스템에 맞게 충분히 커스텀할 수 있다.
