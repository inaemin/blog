"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { NavIcon } from "./NavIcon";

const navItems = [
  { href: "/posts", icon: "list", label: "전체 글" },
  { href: "/craft", icon: "pen-tool", label: "크래프트" },
] as const;

function isActiveNav(pathname: string, href: string) {
  if (href === "/posts") {
    return pathname === "/posts";
  }

  return pathname.startsWith(href);
}

function getNavClassName(isActive: boolean) {
  if (isActive) {
    return "inline-flex items-center gap-1.5 text-sm font-medium text-brand";
  }

  return "inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-brand";
}

function getAriaCurrent(isActive: boolean) {
  if (isActive) {
    return "page";
  }

  return undefined;
}

const mobileItems = navItems.map((item) => ({
  href: item.href,
  icon: item.icon,
  label: item.label,
}));

function getHeaderClassName(isVisible: boolean) {
  const baseClassName =
    "sticky top-0 z-20 flex h-14 justify-center border-b border-border bg-background/95 backdrop-blur transition duration-200 md:h-16";

  if (isVisible) {
    return `${baseClassName} translate-y-0 opacity-100`;
  }

  return `${baseClassName} pointer-events-none -translate-y-full opacity-0`;
}

function isPostDetailPath(pathname: string) {
  return /^\/posts\/[^/]+$/u.test(pathname);
}

function getArticleReadingProgress() {
  const article = document.getElementById("article-reading-content");

  if (!article) {
    return 0;
  }

  const articleRect = article.getBoundingClientRect();
  const articleTop = window.scrollY + articleRect.top;
  const articleHeight = article.scrollHeight;
  const readableDistance = articleHeight - window.innerHeight;

  if (readableDistance <= 0) {
    return 1;
  }

  const rawProgress = (window.scrollY - articleTop) / readableDistance;

  return Math.min(Math.max(rawProgress, 0), 1);
}

function ReadingProgress({
  isEnabled,
  progress,
}: {
  isEnabled: boolean;
  progress: number;
}) {
  if (!isEnabled) {
    return null;
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 h-0.75 bg-border md:hidden"
      aria-hidden="true"
      data-reading-progress-track="true"
    >
      <div
        className="h-full origin-left bg-brand transition-transform duration-100 ease-out motion-reduce:transition-none"
        data-reading-progress-bar="true"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const animationFrameId = useRef(0);
  const hasReadingProgress = isPostDetailPath(pathname);

  useEffect(() => {
    const updateVisibility = () => {
      animationFrameId.current = 0;

      const main = document.getElementById("page-main");

      if (!main) {
        setIsVisible(true);
        setReadingProgress(0);
        return;
      }

      const mainRect = main.getBoundingClientRect();

      setIsVisible(mainRect.bottom > 0 && mainRect.top < window.innerHeight);
      setReadingProgress(getArticleReadingProgress());
    };

    const scheduleVisibilityUpdate = () => {
      if (animationFrameId.current !== 0) {
        return;
      }

      animationFrameId.current = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", scheduleVisibilityUpdate, {
      passive: true,
    });
    window.addEventListener("resize", scheduleVisibilityUpdate);

    return () => {
      if (animationFrameId.current !== 0) {
        window.cancelAnimationFrame(animationFrameId.current);
      }

      window.removeEventListener("scroll", scheduleVisibilityUpdate);
      window.removeEventListener("resize", scheduleVisibilityUpdate);
    };
  }, [pathname]);

  return (
    <header
      className={getHeaderClassName(isVisible)}
      data-visible={isVisible}
      aria-hidden={!isVisible}
    >
      <div className="flex h-full w-full max-w-300 items-center justify-between px-5 md:px-10 xl:px-0">
        <Link href="/" className="text-xl font-medium text-foreground">
          {siteConfig.name}
        </Link>
        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="주요 메뉴"
        >
          {navItems.map((item) => {
            const isActive = isActiveNav(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={getNavClassName(isActive)}
                aria-current={getAriaCurrent(isActive)}
              >
                <NavIcon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <MobileMenu items={mobileItems} />
      </div>
      <ReadingProgress
        isEnabled={hasReadingProgress}
        progress={readingProgress}
      />
    </header>
  );
}
