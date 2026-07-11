"use client";

import type { MouseEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { MarkdownHeading } from "./MarkdownBody";

type ArticleTocProps = {
  headings: MarkdownHeading[];
};

const desktopTocRowHeight = 28;
const desktopTocRowGap = 4;
type DesktopTocRowMetrics = {
  offsets: number[];
  railHeight: number;
  rowHeights: number[];
};

function getDesktopTocRowMetrics(rowHeights: number[]): DesktopTocRowMetrics {
  const offsets = rowHeights.map(
    (_, index) =>
      rowHeights
        .slice(0, index)
        .reduce((sum, rowHeight) => sum + rowHeight, 0) +
      index * desktopTocRowGap,
  );
  const railHeight =
    rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0) +
    Math.max(0, rowHeights.length - 1) * desktopTocRowGap;

  return { offsets, railHeight, rowHeights };
}

function getDefaultDesktopTocRowMetrics(headingCount: number) {
  return getDesktopTocRowMetrics(
    Array.from({ length: headingCount }, () => desktopTocRowHeight),
  );
}

function getMeasuredDesktopTocRowHeight(
  element: HTMLAnchorElement | undefined,
) {
  if (!element) {
    return desktopTocRowHeight;
  }

  return Math.max(
    desktopTocRowHeight,
    Math.ceil(element.getBoundingClientRect().height),
  );
}

function areDesktopTocRowMetricsEqual(
  currentMetrics: DesktopTocRowMetrics,
  nextMetrics: DesktopTocRowMetrics,
) {
  return (
    currentMetrics.railHeight === nextMetrics.railHeight &&
    currentMetrics.rowHeights.length === nextMetrics.rowHeights.length &&
    currentMetrics.rowHeights.every(
      (rowHeight, index) => rowHeight === nextMetrics.rowHeights[index],
    )
  );
}

function getDesktopTocItemElements(
  headings: MarkdownHeading[],
  itemElements: Map<string, HTMLAnchorElement>,
) {
  return headings.flatMap((heading) => {
    const element = itemElements.get(heading.id);

    if (!element) {
      return [];
    }

    return [element];
  });
}

function getTocItemPaddingClassName(heading: MarkdownHeading) {
  if (heading.level === 1) {
    return "px-2.5";
  }

  if (heading.level === 2) {
    return "px-[18px]";
  }

  if (heading.level === 3) {
    return "px-[26px]";
  }

  if (heading.level === 4) {
    return "px-[42px]";
  }

  return "px-[42px]";
}

type TocVariant = "desktop" | "tablet";

type TocItemClassNameInput = {
  activeHeadingId: string;
  heading: MarkdownHeading;
  variant: TocVariant;
};

function getTocItemClassName({
  activeHeadingId,
  heading,
  variant,
}: TocItemClassNameInput) {
  const itemHeightClassName = getTocItemHeightClassName(variant);
  const baseClassName = `flex ${itemHeightClassName} items-center rounded-lg py-1 text-[13px] font-bold leading-[1.38] whitespace-normal [overflow-wrap:anywhere] transition-colors hover:text-brand`;

  if (variant === "tablet" && heading.id === activeHeadingId) {
    return `${baseClassName} bg-tag-bg text-brand ${getTocItemPaddingClassName(heading)}`;
  }

  if (heading.id === activeHeadingId) {
    return `${baseClassName} text-brand ${getTocItemPaddingClassName(heading)}`;
  }

  return `${baseClassName} text-text-muted ${getTocItemPaddingClassName(heading)}`;
}

function getTocItemHeightClassName(variant: TocVariant) {
  if (variant === "desktop") {
    return "min-h-7";
  }

  return "min-h-10";
}

function getAriaCurrent(headingId: string, activeHeadingId: string) {
  if (headingId === activeHeadingId) {
    return "location";
  }

  return undefined;
}

function syncVisibleHeadingId(
  entry: IntersectionObserverEntry,
  visibleHeadingIds: Set<string>,
) {
  if (entry.isIntersecting) {
    visibleHeadingIds.add(entry.target.id);
    return;
  }

  visibleHeadingIds.delete(entry.target.id);
}

function getActiveHeadingIdFromScroll(headingElements: HTMLElement[]) {
  const activeHeading = [...headingElements]
    .reverse()
    .find((element) => element.getBoundingClientRect().top <= 128);

  if (activeHeading) {
    return activeHeading.id;
  }

  return headingElements[0]?.id ?? "";
}

function subscribeToClientMount() {
  return () => undefined;
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function useIsMounted() {
  return useSyncExternalStore(
    subscribeToClientMount,
    getClientSnapshot,
    getServerSnapshot,
  );
}

function getChevronPath(isOpen: boolean) {
  if (isOpen) {
    return "M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z";
  }

  return "M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z";
}

function getChevronState(isOpen: boolean) {
  if (isOpen) {
    return "open";
  }

  return "closed";
}

function TocChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className="flex size-4 shrink-0 items-center justify-center text-text-secondary"
      data-state={getChevronState(isOpen)}
    >
      <svg
        aria-hidden="true"
        className="size-2.5 fill-current"
        focusable="false"
        viewBox="0 0 640 640"
      >
        <path d={getChevronPath(isOpen)} />
      </svg>
    </span>
  );
}

function useActiveHeadingId(headings: MarkdownHeading[]) {
  const headingIds = useMemo(
    () => headings.map((heading) => heading.id),
    [headings],
  );
  const [activeHeadingId, setActiveHeadingId] = useState(headingIds[0] ?? "");
  const [activeHeadingIndex, setActiveHeadingIndex] = useState(0);
  const animationFrameId = useRef(0);
  const pendingHeadingId = useRef("");
  const pendingHeadingTimeoutId = useRef(0);

  const setActiveHeadingById = useCallback(
    (headingId: string) => {
      const headingIndex = headingIds.indexOf(headingId);

      if (headingIndex < 0) {
        return;
      }

      setActiveHeadingId(headingId);
      setActiveHeadingIndex(headingIndex);
    },
    [headingIds],
  );

  const activateHeading = (
    headingId: string,
    event?: MouseEvent<HTMLAnchorElement>,
  ) => {
    pendingHeadingId.current = headingId;
    setActiveHeadingById(headingId);

    if (event) {
      event.preventDefault();
      window.history.pushState(null, "", `#${headingId}`);
      document
        .getElementById(headingId)
        ?.scrollIntoView({ behavior: "auto", block: "start" });
    }

    if (pendingHeadingTimeoutId.current !== 0) {
      window.clearTimeout(pendingHeadingTimeoutId.current);
    }

    pendingHeadingTimeoutId.current = window.setTimeout(() => {
      pendingHeadingId.current = "";
      pendingHeadingTimeoutId.current = 0;
    }, 900);
  };

  useEffect(() => {
    if (headingIds.length === 0) {
      return;
    }

    const visibleHeadingIds = new Set<string>();
    const headingElements = headingIds.flatMap((headingId) => {
      const element = document.getElementById(headingId);

      if (!element) {
        return [];
      }

      return [element];
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (pendingHeadingId.current.length > 0) {
          return;
        }

        for (const entry of entries) {
          syncVisibleHeadingId(entry, visibleHeadingIds);
        }

        const firstVisibleHeadingId = headingIds.find((headingId) =>
          visibleHeadingIds.has(headingId),
        );

        if (firstVisibleHeadingId) {
          setActiveHeadingById(firstVisibleHeadingId);
          return;
        }

        const currentHeadingId = [...headingElements]
          .reverse()
          .find((element) => element.getBoundingClientRect().top <= 120)?.id;

        if (currentHeadingId) {
          setActiveHeadingById(currentHeadingId);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 1] },
    );
    const updateActiveHeadingFromScroll = () => {
      animationFrameId.current = 0;

      if (pendingHeadingId.current.length > 0) {
        return;
      }

      const activeHeadingIdFromScroll =
        getActiveHeadingIdFromScroll(headingElements);

      if (activeHeadingIdFromScroll.length > 0) {
        setActiveHeadingById(activeHeadingIdFromScroll);
      }
    };

    const scheduleActiveHeadingUpdate = () => {
      if (animationFrameId.current !== 0) {
        return;
      }

      animationFrameId.current = window.requestAnimationFrame(
        updateActiveHeadingFromScroll,
      );
    };

    for (const element of headingElements) {
      observer.observe(element);
    }
    window.addEventListener("scroll", scheduleActiveHeadingUpdate, {
      passive: true,
    });
    window.addEventListener("resize", scheduleActiveHeadingUpdate);
    scheduleActiveHeadingUpdate();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleActiveHeadingUpdate);
      window.removeEventListener("resize", scheduleActiveHeadingUpdate);

      if (animationFrameId.current !== 0) {
        window.cancelAnimationFrame(animationFrameId.current);
      }

      if (pendingHeadingTimeoutId.current !== 0) {
        window.clearTimeout(pendingHeadingTimeoutId.current);
      }
    };
  }, [headingIds, setActiveHeadingById]);

  return { activeHeadingId, activeHeadingIndex, activateHeading };
}

function TocItems({
  headings,
  activeHeadingId,
  onItemElement,
  onActivateHeading,
  variant,
}: ArticleTocProps & {
  activeHeadingId: string;
  onActivateHeading: (
    headingId: string,
    event?: MouseEvent<HTMLAnchorElement>,
  ) => void;
  onItemElement?: (
    headingId: string,
    element: HTMLAnchorElement | null,
  ) => void;
  variant: TocVariant;
}) {
  if (headings.length === 0) {
    return (
      <p className="text-sm leading-6 text-text-muted">
        아직 표시할 목차가 없어요.
      </p>
    );
  }

  return (
    <nav aria-label="글 목차" className="flex flex-col gap-1">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={getTocItemClassName({ activeHeadingId, heading, variant })}
          aria-current={getAriaCurrent(heading.id, activeHeadingId)}
          data-active={heading.id === activeHeadingId}
          onClick={(event) => onActivateHeading(heading.id, event)}
          ref={(element) => onItemElement?.(heading.id, element)}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}

export function InlineArticleToc({ headings }: ArticleTocProps) {
  const isMounted = useIsMounted();
  const { activeHeadingId, activateHeading } = useActiveHeadingId(headings);
  const [isTocOpen, setIsTocOpen] = useState(true);

  if (!isMounted) {
    return null;
  }

  return (
    <details
      open={isTocOpen}
      className="fixed top-24.5 right-8.25 z-10 hidden w-58.5 flex-col gap-2 md:flex xl:hidden"
      onToggle={(event) => setIsTocOpen(event.currentTarget.open)}
    >
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-border bg-surface px-3 text-[13px] leading-[1.35] font-bold text-foreground shadow-[0_2px_4px_#00000014]">
        목차
        <TocChevronIcon isOpen={isTocOpen} />
      </summary>
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-2 shadow-[0_8px_18px_#0F172A24]">
        <TocItems
          headings={headings}
          activeHeadingId={activeHeadingId}
          onActivateHeading={activateHeading}
          variant="tablet"
        />
      </div>
    </details>
  );
}

export function DesktopArticleToc({ headings }: ArticleTocProps) {
  const isMounted = useIsMounted();
  const { activeHeadingId, activeHeadingIndex, activateHeading } =
    useActiveHeadingId(headings);
  const itemElements = useRef(new Map<string, HTMLAnchorElement>());
  const [rowMetrics, setRowMetrics] = useState(() =>
    getDefaultDesktopTocRowMetrics(headings.length),
  );
  const activeLineOffset = rowMetrics.offsets[activeHeadingIndex] ?? 0;
  const activeLineHeight =
    rowMetrics.rowHeights[activeHeadingIndex] ?? desktopTocRowHeight;

  const registerItemElement = useCallback(
    (headingId: string, element: HTMLAnchorElement | null) => {
      if (!element) {
        itemElements.current.delete(headingId);
        return;
      }

      itemElements.current.set(headingId, element);
    },
    [],
  );

  useEffect(() => {
    if (!isMounted) {
      return undefined;
    }

    const syncRowMetrics = () => {
      const rowHeights = headings.map((heading) =>
        getMeasuredDesktopTocRowHeight(itemElements.current.get(heading.id)),
      );
      const nextMetrics = getDesktopTocRowMetrics(rowHeights);

      setRowMetrics((currentMetrics) => {
        if (areDesktopTocRowMetricsEqual(currentMetrics, nextMetrics)) {
          return currentMetrics;
        }

        return nextMetrics;
      });
    };
    const resizeObserver = new ResizeObserver(syncRowMetrics);

    syncRowMetrics();
    getDesktopTocItemElements(headings, itemElements.current).forEach(
      (element) => resizeObserver.observe(element),
    );
    window.addEventListener("resize", syncRowMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncRowMetrics);
    };
  }, [headings, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 flex w-73.75 flex-col gap-3 py-0">
        <p className="text-base leading-[1.45] font-bold text-foreground">
          목차
        </p>
        <div className="flex gap-3">
          <div
            aria-hidden="true"
            className="relative w-1.5 shrink-0"
            style={{ height: rowMetrics.railHeight }}
          >
            <div
              className="absolute left-0.5 w-0.5 rounded-full bg-rail"
              style={{ height: rowMetrics.railHeight }}
            />
            <div
              className="absolute left-0.5 w-0.5 rounded-full bg-brand transition-[height,transform] duration-200 ease-out motion-reduce:transition-none"
              style={{
                height: activeLineHeight,
                transform: `translateY(${activeLineOffset}px)`,
              }}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <TocItems
              headings={headings}
              activeHeadingId={activeHeadingId}
              onActivateHeading={activateHeading}
              onItemElement={registerItemElement}
              variant="desktop"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
