# 댓글 시스템

## 목적

로그인 없이 댓글을 작성할 수 있는 Toss Tech 스타일의 댓글 시스템을 만든다. 단, 모든 댓글을 즉시 공개하지 않고, moderation을 통과한 댓글만 공개한다.

## 댓글 UX

현재 목업은 다음 형태를 전제로 한다.

```txt
랜덤 닉네임
+ 랜덤 아바타/이니셜
+ 댓글 입력창
+ 제출 버튼
```

사용자는 별도 계정을 만들거나 GitHub/social 로그인을 하지 않아도 댓글을 남길 수 있다.

닉네임 예시:

```txt
재미있는나비
푸른나비
느긋한고래
명랑한다람쥐
```

댓글 작성 UI는 가볍게 유지한다.

- 닉네임 표시
- 닉네임 옆 상대 시간 표시 (`초 전`, `분 전`, `시 전`, `일 전`, `달 전`, `년 전`)
- 랜덤 닉네임 변경 버튼
- 댓글 textarea
- 제출 버튼
- 필요 시 Turnstile widget

제출 후 UX:

- 사용자가 댓글을 제출하면 클라이언트 목록에 optimistic comment를 즉시 추가한다.
- 새 optimistic comment는 현재 시각을 `createdAt`으로 사용하므로 처음에는 `0초 전`처럼 표시된다.
- 서버 저장과 moderation 결과는 이후 반영하되, 작성 직후 화면에서는 댓글 수와 목록이 바로 갱신되어야 한다.

## API 흐름

### 댓글 작성

```txt
POST /api/comments
```

처리 순서:

```txt
요청 body 검증
→ honeypot 확인
→ rate limit 확인
→ Turnstile token 검증
→ AI moderation 실행
→ moderation 결과를 status로 변환
→ Supabase에 저장
→ 결과 반환
```

개념 예시:

```ts
export async function POST(req: Request) {
  const body = await req.json();

  validateCommentInput(body);
  rejectIfHoneypotFilled(body);

  await rateLimit(req);
  await verifyTurnstile(body.turnstileToken);

  const moderation = await moderateComment({
    comment: {
      nickname: body.nickname,
      body: body.comment,
    },
    article: {
      slug: body.postSlug,
      title: body.articleTitle,
      excerpt: body.articleExcerpt,
      tags: body.articleTags,
      summary: body.articleSummary,
    },
  });

  const status = mapModerationDecisionToStatus(moderation.decision);

  await saveCommentToSupabase({
    postSlug: body.postSlug,
    nickname: body.nickname,
    body: body.comment,
    status,
    moderationResult: moderation,
  });

  return Response.json({ ok: true, status });
}
```

### 댓글 조회

```txt
GET /api/comments?postSlug=...
```

처리 원칙:

```txt
Supabase에서 status = approved 인 댓글만 조회
created_at 기준 정렬
public client에는 moderation_result, ip_hash 등 내부 필드를 반환하지 않음
```

## 요청 Payload

댓글 작성 요청은 최소한 다음 값을 포함한다.

```json
{
  "postSlug": "frontend-state-management",
  "nickname": "재미있는나비",
  "comment": "좋은 글 감사합니다!",
  "turnstileToken": "...",
  "honeypot": "",
  "articleTitle": "프론트엔드에서 상태 관리를 단순하게 유지하는 법",
  "articleExcerpt": "복잡한 상태 관리 도구를 도입하기 전에 구조를 먼저 정리하는 방법을 다룹니다.",
  "articleTags": ["Frontend", "React"],
  "articleSummary": "React 기반 기술 글이며 상태 관리 복잡도를 줄이는 방법을 설명한다."
}
```

## 댓글 상태

추천 status:

```txt
pending
approved
spam
rejected
```

의미:

- `pending`: 사람이 확인해야 하는 댓글.
- `approved`: 공개 가능한 댓글.
- `spam`: 명백한 스팸/광고/자동화 댓글.
- `rejected`: 정책 위반으로 공개하지 않는 댓글.

AI moderation 결과 매핑:

```txt
allow        → approved
needs_review → pending
reject       → spam 또는 rejected
```

공개 화면에는 `approved` 댓글만 노출한다.

## 데이터베이스 Schema

최소 comments table:

```sql
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  nickname text not null,
  body text not null,
  status text not null default 'pending',
  moderation_result jsonb,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hidden boolean not null default false,
  deleted_at timestamptz
);
```

### 공개 조회 조건

```sql
where status = 'approved'
  and hidden = false
  and deleted_at is null
```

## 관리자 운영

AI를 사용하더라도 수동 운영 기능은 필요하다.

최소 관리자 action:

```txt
pending 댓글 승인
pending 댓글 거절
approved 댓글 숨김
댓글을 spam으로 표시
댓글 soft delete
```

초기에는 별도 관리자 UI 없이 Supabase table/editor로 운영할 수 있다. 댓글 수가 많아지면 전용 admin route를 만든다.

## 보안 / 개인정보 메모

- IP와 user-agent는 원문 저장보다 hash 저장을 우선 고려한다.
- public API 응답에는 내부 moderation 결과와 hash 값을 포함하지 않는다.
- 댓글 삭제는 hard delete보다 `deleted_at` 기반 soft delete로 시작한다.
- 작성자가 직접 수정/삭제할 수 없는 구조라면 UI에 이 점을 안내한다.
