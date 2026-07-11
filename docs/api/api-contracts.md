# API 계약

## 목적

Next.js Route Handler로 제공할 런타임 API의 요청/응답 형식을 정리한다.

관련 문서:

- [`comment-system.md`](../comments/comment-system.md)
- [`moderation-policy.md`](../comments/moderation-policy.md)
- [`infra.md`](../architecture/infra.md)

## 댓글 작성

```txt
POST /api/comments
```

댓글 작성 UI는 `CommentComposer`가 담당한다.

`CommentComposer`에 포함할 요소:

```txt
랜덤 닉네임 표시
랜덤 닉네임 변경 버튼
댓글 textarea
honeypot hidden field
Turnstile widget
제출 버튼
에러/성공 메시지
```

Turnstile widget 역할:

```txt
브라우저에서 사람/봇 여부를 확인
→ 성공 시 turnstileToken 발급
→ 댓글 제출 payload에 token 포함
→ /api/comments에서 Cloudflare Siteverify로 서버 검증
→ 검증 성공 시에만 moderation/DB 저장 단계로 진행
```

중요한 점:

```txt
프론트에서 token을 받는 것만으로는 충분하지 않다.
서버에서 반드시 Turnstile token을 검증해야 한다.
```

Request:

```json
{
  "postSlug": "nextjs-app-router-cache-strategy",
  "nickname": "재미있는나비",
  "comment": "좋은 글 감사합니다!",
  "turnstileToken": "...",
  "honeypot": "",
  "articleTitle": "Next.js App Router 캐시 전략 정리",
  "articleExcerpt": "데이터 성격에 따라 캐시 전략을 나누는 기준을 정리합니다.",
  "articleTags": ["Next.js", "Caching"],
  "articleSummary": "Next.js App Router 캐시 전략에 대한 기술 글"
}
```

Response:

```json
{
  "ok": true,
  "status": "approved"
}
```

Error response:

```json
{
  "ok": false,
  "code": "RATE_LIMITED",
  "message": "잠시 후 다시 시도해주세요."
}
```

## 댓글 조회

```txt
GET /api/comments?postSlug=nextjs-app-router-cache-strategy
```

Response:

```json
{
  "comments": [
    {
      "id": "uuid",
      "postSlug": "nextjs-app-router-cache-strategy",
      "nickname": "재미있는나비",
      "body": "좋은 글 감사합니다!",
      "createdAt": "2026-07-10T12:00:00Z"
    }
  ]
}
```

내부 필드는 public response에 포함하지 않는다.

제외 필드:

```txt
moderation_result
ip_hash
user_agent_hash
hidden
deleted_at
```

## 인기 글 조회

```txt
GET /api/popular-posts
```

Response:

```json
{
  "posts": [
    {
      "slug": "nextjs-app-router-cache-strategy",
      "title": "Next.js App Router 캐시 전략 정리",
      "tag": "Next.js",
      "rank": 1,
      "score": 1240
    }
  ]
}
```

Vercel Web Analytics `visits/aggregate` API에서 최근 30일 `/posts/*` pageviews를 조회해 `score`로 사용한다.
환경 변수가 없거나 Analytics API 조회가 실패하면 공개 글 목록 기반 fallback을 반환하며, 이때 `score`는 `0`이다.

## Error Code 기준

```txt
INVALID_INPUT
HONEYPOT_DETECTED
RATE_LIMITED
TURNSTILE_FAILED
MODERATION_FAILED
DATABASE_ERROR
UNKNOWN_ERROR
```

사용자에게는 내부 오류를 자세히 노출하지 않는다.
