import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 justify-center">
        <main
          id="page-main"
          className="w-full max-w-300 px-5 pt-5 pb-12 md:px-10 md:pt-6.5 xl:px-0"
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
