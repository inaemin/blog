# Blog Mini Design System

이 문서는 `design/blog-draft/blog-draft.pen` 목업을 구현하기 위한 **블로그용 mini design system + page template spec**입니다. 대형 제품 디자인 시스템처럼 모든 화면을 개별 규격화하지 않고, 공통 토큰과 반복 컴포넌트를 우선합니다.

## 1. Foundations

### Font

| 구분 | 값 |
| --- | --- |
| Pencil 목업 렌더링 | `Noto Sans KR` |
| 실제 웹 구현 권장 스택 | `Noto Sans KR`, `Pretendard`, `Inter`, `sans-serif` |
| Code font | `Geist Mono` |

### Color Tokens

| Token | Value | 용도 |
| --- | --- | --- |
| Background | `#F9FAFB` | 기본 배경, 아이콘 버튼 배경 |
| Surface white | `#FFFFFF` | dropdown panel, sidebar inner item, elevated row |
| Surface / Card | `#F2F4F6` | 카드 배경, hover 배경, 보조 버튼 배경 |
| Primary text | `#191F28` | 주요 제목/본문 텍스트 |
| Strong text | `#333D4B` | Article body, comment text, hover text |
| Secondary text | `#4E5968` | 보조 텍스트, 기본 내비게이션 |
| Muted text | `#5F6B7A` | 메타 정보, 낮은 강조 텍스트/아이콘 |
| Disabled text | `#8B95A1` | disabled 텍스트/아이콘 |
| Brand blue | `#1B64DA` | 주요 액션, 활성 상태, 포커스 링 |
| Border | `#E5E8EB` | 기본 보더, outline 버튼/칩 |
| Rail / Divider muted | `#D1D6DB` | TOC rail track, 약한 구분선 |
| Tag background | `#EBF3FF` | 활성 태그, 콘텐츠 태그, dropdown active 배경 |
| Tag border | `#BFD9FF` | 필터 태그 active 보더, icon open 보더 |
| Transparent | `#FFFFFF00` | 투명 row/frame fill |

### Deprecated / Migration Notes

아래 값은 이전 목업에 남아 있을 수 있습니다. 신규 구현에서는 canonical token으로 교체합니다.

| Deprecated value | Canonical token |
| --- | --- |
| `#3182F6` | Brand blue `#1B64DA` |

### Effects

| Token | Value | 용도 |
| --- | --- | --- |
| Dropdown shadow | color `#00000014`, offset `0 8`, blur `24` | Mobile header dropdown panel |
| Floating panel shadow | color `#191F281F`, offset `0 10`, blur `24`, spread `-8` | Tablet TOC dropdown panel |

## 2. Responsive Scale

### Reference Frames and Layout

`390`, `834`, `1440`은 CSS breakpoint가 아니라 목업을 기준으로 한 대표 검수용 frame width입니다. 실제 구현의 breakpoint는 이 값을 그대로 쓰기보다 Mobile/Tablet/Desktop 레이아웃이 전환되는 지점으로 별도 정의합니다.

### Implementation Breakpoints

Breakpoint는 화면 폭이 특정 기준을 넘을 때 CSS layout이 바뀌는 전환 지점입니다. 이 블로그는 mobile-first로 구현하고, 기본 스타일은 Mobile에 적용한 뒤 Tablet/Desktop 구간에서 필요한 스타일만 확장합니다.

Tailwind 기본 breakpoint를 그대로 사용합니다. 다만 이 블로그의 큰 레이아웃 전환은 아래 기준으로 잡습니다. `sm`, `lg`는 필요할 때 세부 spacing이나 typography 보정에만 사용하고, 주요 page layout 전환 기준으로는 사용하지 않습니다.

| 구간 | CSS range | Tailwind 기준 | 역할 |
| --- | --- | --- | --- |
| Mobile | `< 768px` | `base` | 단일 컬럼, 모바일 헤더/dropdown, 썸네일 숨김 |
| Tablet | `>= 768px` | `md` | tablet spacing, 썸네일 노출, article TOC dropdown |
| Desktop | `>= 1280px` | `xl` | 최대 `1200px` 콘텐츠, 본문+sidebar/TOC 2-column, sticky TOC |

Tailwind 기본값 중 `lg = 1024px`는 desktop 2-column을 켜기에는 좁을 수 있으므로, 본문과 sidebar/TOC가 함께 배치되는 desktop layout은 `xl = 1280px`부터 적용합니다.

검수는 breakpoint 경계와 reference frame width를 모두 확인합니다.

```txt
Breakpoint boundary: 767, 768, 1279, 1280
Reference frame: 390, 834, 1440
```

`sm` 또는 `lg` 전용 스타일을 추가한 경우에는 해당 경계도 함께 검수합니다.

```txt
Optional boundary: 639, 640, 1023, 1024
```

| 항목 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Frame width | `390` | `834` | `1440` |
| Screen padding | `0 20 22 20` | `0 33~42 34 33~42` | side padding `120` |
| Content max width | - | fill container | `1200` |
| Header height | `56` | `64` | `64` |
| Header → content | `20~22` | `26` | `28` 일반 / `40` Article |
| Main/sidebar gap | - | `24` | `40` 일반 / `64` Article TOC |

### Typography Scale

| 역할 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Page title | `16 / 500 / 1.18` | `18 / 500 / 1.18` | `20 / 500 / 1.18` |
| Post title | `18 / 700 / 1.28` | `19 / 700 / 1.25` | `20 / 700 / 1.25` |
| Card / sidebar title | `14 / 500 / 1.25` | `14 / 500 / 1.25` | `14 / 500 / 1.25` |
| Supporting item title | `15 / 500 / 1.32` | `15 / 500 / 1.32` | `15 / 500 / 1.35` |
| Body preview | `13 / 400 / 1.35` | `13 / 400 / 1.35` | `14 / 400 / 1.35` |
| Caption / Meta | `12 / 400 / 1.35` | `12 / 400 / 1.35` | `13 / 400 / 1.35` |
| Label / Tag | `11 / 500 / 1.2` | `11 / 500 / 1.2` | `12 / 500 / 1.2` |

### Shared Spacing

| 항목 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Home title → list | `18` | `20` | `22` |
| All posts title → meta | `6` | `6` | `6` |
| All posts intro → list | `18` | `20` | `22` |
| List item gap | `20` | `24` | `28` |
| Post internal gap | `8` | `8` | `8` |
| Text ↔ thumbnail gap | - | `16` | `18` |
| Sidebar stack gap | - | - | `14` |

## 3. Core Components

### Post List Item

| 항목 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Item layout | vertical text only | text + thumbnail | text + thumbnail |
| Item padding bottom | `14` | `14` | `14` |
| Divider | bottom `1px #E5E8EB` | bottom `1px #E5E8EB` | bottom `1px #E5E8EB` |
| Thumbnail | - | `116 x 80`, radius `14`, bg `#F2F4F6`, padding `14`, gap `8` | `128 x 88`, radius `14`, bg `#F2F4F6`, padding `16`, gap `9` |

### Sidebar Cards

| Component | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Popular posts card | `#F2F4F6`, radius `18`, padding `16`, gap `12` | `#F2F4F6`, radius `18`, padding `18`, gap `12` | `#F2F4F6`, radius `18`, padding `18`, gap `12` |
| Popular row | gap `10` | gap `10`, bordered row | gap `10`, bordered row |
| Popular rank | `Geist Mono`, `12 / 500 / 1` | `Geist Mono`, `12 / 500 / 1` | `Geist Mono`, `12 / 500 / 1` |
| Popular item title | `13 / 500 / 1.28` | `13 / 500 / 1.28` | `13 / 500 / 1.28` |
| Popular tag | `12 / 400 / 1.2` | `12 / 400 / 1.2` | `12 / 400 / 1.2` |
| Latest comments card | `#F2F4F6`, radius `18`, padding `14`, gap `10` | `#F2F4F6`, radius `18`, padding `14`, gap `10` | `#F2F4F6`, radius `18`, padding `16`, gap `10` |
| Latest comment item | white, radius `12`, padding `10`, gap `6` | white, radius `12`, padding `10 11`, gap `6`, border | white, radius `12`, padding `10 11`, gap `6`, border |
| Tags card | - | - | title `14 / 500 / 1.25`, card gap `10`, row gap `8` |

### Tags and Badges

| Variant | 규칙 |
| --- | --- |
| Content tag | `bg #EBF3FF`, border 없음, radius `9999`, padding `4 8`, text `#1B64DA`, label `11 / 500` |
| Post tag | Mobile/Tablet `11 / 500 / 1.2`, Desktop `12 / 500 / 1.2`, bg `#EBF3FF`, text `#1B64DA` |
| Filter tag default | height `32`, padding `0 8`, radius `8`, text `#5F6B7A`, transparent bg |
| Filter tag active | height `32`, padding `0 8`, radius `8`, bg `#EBF3FF`, border `#BFD9FF`, text `#1B64DA`, weight `500` |
| Status / Reading | bg `#EBF3FF`, text `#1B64DA`, radius `9999`, padding `3 7`, label `11 / 500 / 14` |

### Interactive Elements

| Variant | 규칙 |
| --- | --- |
| Primary button | bg `#1B64DA`, text `#FFFFFF`, height `44`, padding `0 18`, radius `8`, label `13 / 500` |
| Primary compact | bg `#1B64DA`, text `#FFFFFF`, height `32`, padding `0 14`, radius `8`, label `13 / 500` |
| Secondary compact | bg `#F2F4F6`, border `#E5E8EB`, text `#4E5968`, height `26`, padding `0 10`, radius `6`, label `11 / 500` |
| Icon circle | `44 x 44`, bg `#F9FAFB`, radius `22`, icon `#5F6B7A` |
| Icon outline | `44 x 44`, bg `#F9FAFB`, border `#E5E8EB`, radius `12`, icon `#5F6B7A` |
| Icon open | `44 x 44`, bg `#EBF3FF`, border `#BFD9FF`, radius `12`, icon `#1B64DA` |
| View all link | text `#1B64DA`, label `13 / 500`, gap `6`, `arrow-right 14 x 14` |
| Nav default | text `#4E5968`, icon `#5F6B7A`, bg 없음 |
| Nav active | text/icon `#1B64DA`, weight `500`, bg 없음 |
| Focus-visible | `2px ring #1B64DA`, offset `2` |
| Disabled | text/icon `#8B95A1`, opacity 사용 안 함 |

### Form and Dropdown

| Component | 규칙 |
| --- | --- |
| Nickname input | height `38`, radius `8`, border `1px #E5E8EB`, padding `0 8`, gap `8`, text `13 / 500 / 1.35`, color `#191F28` |
| Nickname random-change button | `Secondary compact`, text line-height `1.35` |
| Comment submit button | `Primary` |
| Mobile header dropdown panel | width `300`, height `106`, bg `#FFFFFF`, border `#E5E8EB`, radius `16`, shadow `Dropdown`, padding `8`, gap `2` |
| Mobile dropdown row | height `44`, radius `10`, padding `0 10`, gap `10`; active bg `#EBF3FF`, text/icon `#1B64DA` |
| Tablet TOC dropdown panel | bg `#FFFFFF`, border `#E5E8EB`, radius `12`, padding `8`, gap `4`, shadow `Floating panel` |
| Tablet TOC dropdown row | height `40`, radius `8`; active bg `#EBF3FF`, text `#1B64DA` |

### Unified Footer

모든 페이지 footer는 같은 구조와 scale을 사용합니다. Copy는 `Annie Way`, `Inspired by toss.tech`, `Built by inaemin · annie` 3줄을 유지하고, links는 lucide `github`, `mail`, `rss` 아이콘을 사용합니다.

| 항목 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Top space | `34` | `48` | `48` |
| Footer height | `96` | `104` | `112` |
| Padding | page horizontal padding | page horizontal padding | `0 120` |
| Border top | `1px #E5E8EB` | `1px #E5E8EB` | `1px #E5E8EB` |
| Brand | `12 / 500 / 1.25` | `15 / 500 / 1.35` | `15 / 500 / 1.35` |
| Meta text | `11 / 400 / 1.25` | `12 / 400 / 1.35` | `12 / 400 / 1.35` |
| Icon | `14 x 14` | `20 x 20` | `14 x 14` |
| Copy gap | `2` | `3` | `2` |
| Links gap | `12` | `16` | `12` |

## 4. Page Templates

### Home / All Posts

| 항목 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Page title | typography scale의 Page title 사용 | typography scale의 Page title 사용 | typography scale의 Page title 사용 |
| Title → list | Home `18`, All Posts는 title→meta `6` + intro→list `18` | Home `20`, All Posts는 `6` + `20` | Home `22`, All Posts는 `6` + `22` |
| List item gap | `20` | `24` | `28` |
| Desktop list column | - | - | `865` |
| Desktop sidebar | - | - | width `295`, stack gap `14` |

### Article Detail

#### Article Typography

| 역할 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Article title | `28 / 700 / 34` | `34 / 700 / 41` | `38 / 700 / 44` |
| H2 | `22 / 600 / 32` | `22 / 600 / 32` | `24 / 600 / 35` |
| H3 | `18 / 600 / 26` | `18 / 600 / 26` | `20 / 600 / 29` |
| H4 | `16 / 600 / 23` | `16 / 600 / 23` | `17 / 600 / 25` |
| Body | `16 / 400 / 27` | `16 / 400 / 27` | `17 / 400 / 29` |
| Summary | `14 / 400 / 20` | `14 / 400 / 20` | `14 / 400 / 20` |
| Caption / Meta | `12 / 400 / 16` | `12 / 400 / 17` | `13 / 400 / 18` |
| Code | `14 / 400 / 22` | `14 / 400 / 22` | `14 / 400 / 22` |

#### Article Layout

| 항목 | Mobile | Tablet | Desktop |
| --- | ---: | ---: | ---: |
| Header → content | `22` | `26` | `40` |
| Article header gap | `16` | `18` | `20` |
| Article body gap | `20` | `22` | `24` |
| Article column | fill | fill | `820` |
| Article ↔ TOC gap | - | - | `64` |
| TOC width | - | `234 dropdown` | `295` |
| Comment section gap | `12` | `12` | `12` |
| Comment title ↔ count gap | `6` | `6` | `6` |
| Comment composer padding | `12` | `16` | `18` |
| Comment card padding | `14` | `14` | `16` |

#### TOC Item System

Tablet은 floating dropdown, Desktop은 sticky rail로 배치 방식은 다르지만 목차 아이템 자체의 rhythm은 동일하게 유지합니다.

| 항목 | 규칙 |
| --- | --- |
| Item typography | `13 / 500 / 1.38` |
| Active text | `#1B64DA` |
| Inactive text | `#5F6B7A` |
| Row height | `40` |
| Row radius | `8` |
| Row gap | `4` |
| Indent depth | level 1 `10`, level 2 `26`, level 3 `42` |
| Tablet presentation | floating dropdown, trigger `44` height, panel padding `8`, width `234` |
| Desktop presentation | sticky rail + content, rail starts below TOC label and fills item-list height, active line matches active row `2 x 40`, width `295` |

#### Article Content Components

| Component | 규칙 |
| --- | --- |
| Image block | Mobile `350 x 210`, Tablet fill x `280`, Desktop fill x `300`; bg `#EBF3FF`, border `#D6E7FF`, radius `14`, caption gap `8` |
| Code block | bg `#F2F4F6`, border `#E5E8EB`, radius `8`, padding `16`, gap `6`, font `Geist Mono`, text `14 / 400 / 22` |
| Article table header | Reserved: bg `#F2F4F6`, text `#5F6B7A`, label `12 / 500` |
| Article table cell | Reserved: border `#E5E8EB`, text `#4E5968`, body `12 / 500 / 17` |

### Comments

| 역할 | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Comment section title | `18 / 500 / 1.3` | `18 / 500 / 1.3` | `20 / 500 / 1.3` |
| Comment count | `12 / 500 / 1.25` | `12 / 500 / 1.25` | `12 / 500 / 1.25` |
| Comment body | `13 / 400 / 18` | `13 / 400 / 18` | `14 / 400 / 19` |
| Avatar initial | `11 / 500 / 1` | `11 / 500 / 1` | `12 / 500 / 1.35` |

## 5. Implementation Notes

- 실제 웹 구현 시 px 값은 rem 기반으로 변환합니다. 예: `26px` → `1.625rem`.
- 문서에 새 규칙을 추가할 때는 먼저 shared token/component로 표현 가능한지 확인합니다.
- 화면별 예외는 `Page Templates`에만 추가하고, `Foundations`/`Core Components`에 중복 표를 만들지 않습니다.
