import type { ReactNode } from "react";

type NavIconName = "list" | "menu" | "pen-tool" | "x";

function IconShell({ children, size }: { children: ReactNode; size: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {children}
    </svg>
  );
}

export function NavIcon({ name, size }: { name: NavIconName; size: number }) {
  if (name === "list") {
    return (
      <IconShell size={size}>
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
        <path d="M3 6h.01" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M8 6h13" />
      </IconShell>
    );
  }

  if (name === "menu") {
    return (
      <IconShell size={size}>
        <path d="M4 12h16" />
        <path d="M4 18h16" />
        <path d="M4 6h16" />
      </IconShell>
    );
  }

  if (name === "x") {
    return (
      <IconShell size={size}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </IconShell>
    );
  }

  return (
    <IconShell size={size}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </IconShell>
  );
}
