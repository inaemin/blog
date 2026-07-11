import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { formatDate, getPublishedCraftItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "크래프트",
  description: "작업물, 실험, 짧은 기록을 모아둔 페이지입니다.",
};

export default async function CraftPage() {
  const items = await getPublishedCraftItems();

  return (
    <PageShell>
      <section className="flex max-w-216.25 flex-col gap-4.5 md:gap-5 xl:gap-5.5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-base leading-[1.18] font-medium md:text-lg xl:text-xl">
            크래프트
          </h1>
          <p className="text-sm text-text-muted">
            작업물, 실험, 짧은 기록을 모아둡니다.
          </p>
        </div>
        <div className="space-y-5 md:space-y-6 xl:space-y-7">
          {items.map((item) => (
            <article
              key={item.slug}
              className="flex flex-col gap-2 border-b border-border pb-3.5"
            >
              <p className="text-xs text-text-muted">
                {formatDate(item.publishedAt)}
              </p>
              <h2 className="text-lg leading-[1.28] font-bold text-foreground md:text-[19px] xl:text-xl">
                {item.title}
              </h2>
              <p className="text-[13px] leading-[1.35] text-text-secondary xl:text-sm">
                {item.description}
              </p>
            </article>
          ))}
          {items.length === 0 && (
            <p className="rounded-2xl bg-card p-4 text-sm leading-[1.45] text-text-muted md:p-5">
              아직 공개된 크래프트가 없습니다.
            </p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
