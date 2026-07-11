"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "./NavIcon";

type MobileMenuProps = {
  items: Array<{ href: string; icon: "list" | "pen-tool"; label: string }>;
};

function isActiveNav(pathname: string, href: string) {
  if (href === "/posts") {
    return pathname === "/posts";
  }

  return pathname.startsWith(href);
}

function getMenuRowClassName(isActive: boolean) {
  if (isActive) {
    return "flex h-11 items-center gap-2.5 rounded-[10px] bg-tag-bg px-2.5 text-sm font-medium text-brand";
  }

  return "flex h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-sm font-medium text-text-secondary hover:bg-tag-bg hover:text-brand";
}

function getMenuButtonClassName(isOpen: boolean) {
  if (isOpen) {
    return "flex size-11 items-center justify-center rounded-xl border border-tag-border bg-tag-bg text-brand";
  }

  return "flex size-11 items-center justify-center rounded-xl border border-border bg-background text-text-muted";
}

function getAriaCurrent(isActive: boolean) {
  if (isActive) {
    return "page";
  }

  return undefined;
}

function getMenuIconName(isOpen: boolean) {
  if (isOpen) {
    return "x";
  }

  return "menu";
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="메뉴 열기"
        onClick={() => setIsOpen((value) => !value)}
        className={getMenuButtonClassName(isOpen)}
      >
        <NavIcon name={getMenuIconName(isOpen)} size={18} />
      </button>
      {isOpen && (
        <div className="absolute top-13 right-0 z-10 flex h-26.5 w-75 flex-col gap-0.5 rounded-2xl border border-border bg-surface p-2 shadow-[0_8px_24px_#00000014]">
          {items.map((item) => {
            const isActive = isActiveNav(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={getMenuRowClassName(isActive)}
                aria-current={getAriaCurrent(isActive)}
              >
                <NavIcon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
