"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageTransition } from "@/components/shared/page-transition";
import { Container } from "@/components/layout/container";
import { isImmersiveRoute } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const immersive = isImmersiveRoute(pathname);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <a
          href="#platform-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>

        <TopNav />

        <main id="platform-main" className="relative">
          <Container
            className={cn(
              immersive ? "py-6" : "pt-20 pb-24 lg:pt-[72px] lg:pb-6"
            )}
          >
            <PageTransition>{children}</PageTransition>
          </Container>
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
