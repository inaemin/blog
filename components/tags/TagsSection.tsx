import Link from "next/link";

export function TagsSection({ tags }: { tags: string[] }) {
  return (
    <section
      className="hidden flex-col gap-2.5 rounded-[18px] bg-card p-4.5 xl:flex"
      aria-labelledby="tags-title"
    >
      <h2
        id="tags-title"
        className="text-sm leading-tight font-medium text-foreground"
      >
        태그
      </h2>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/posts"
          className="flex h-8 items-center rounded-lg border border-tag-border bg-tag-bg px-2 text-xs font-medium text-brand"
        >
          전체
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="flex h-8 items-center rounded-lg px-2 text-xs text-text-muted hover:bg-tag-bg hover:text-brand"
          >
            {tag}
          </Link>
        ))}
      </div>
    </section>
  );
}
