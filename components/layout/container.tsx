import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "main" | "footer" | "nav";
};

export function Container({ children, className, as = "div" }: ContainerProps) {
  const Comp = as;

  return <Comp className={cn("layout-container", className)}>{children}</Comp>;
}
