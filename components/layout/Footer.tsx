import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-3.5 items-center justify-center md:size-5 xl:size-3.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

export function Footer() {
  return (
    <footer
      id="page-footer"
      className="flex justify-center bg-card py-8.5 md:py-12"
    >
      <div className="flex w-full max-w-300 items-end justify-between px-5 text-text-muted md:px-10 xl:px-0">
        <div className="space-y-0.5 md:space-y-0.75 xl:space-y-0.5">
          <p className="text-xs font-medium text-foreground md:text-[15px]">
            {siteConfig.name}
          </p>
          <p className="text-[11px] md:text-xs">Inspired by toss.tech</p>
          <p className="text-[11px] md:text-xs">Built by inaemin · annie</p>
        </div>
        <div className="flex items-center gap-3 md:gap-4 xl:gap-3">
          <a
            href="https://github.com/inaemin"
            aria-label="GitHub"
            className="inline-flex text-text-muted transition-colors duration-150 hover:text-text-strong"
          >
            <Icon>
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5a10.5 10.5 0 0 0-6 0C8 2 7 2 7 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 6 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S10.93 17.38 11 18v4" />
              <path d="M9 18c-4.5 2-5-2-7-2" />
            </Icon>
          </a>
          <Link
            href="/rss.xml"
            aria-label="RSS"
            className="inline-flex text-text-muted transition-colors duration-150 hover:text-text-strong"
          >
            <Icon>
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </Icon>
          </Link>
        </div>
      </div>
    </footer>
  );
}
