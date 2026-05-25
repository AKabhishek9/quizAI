import Link from "next/link";
import Image from "next/image";
import { Container } from "./container";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/quiz", label: "Quizzes" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Footer() {
  return (
    <footer className="relative pb-8 pt-4">
      <Container>
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm px-8 py-8">
          <div className="flex flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="QuizAI Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground font-heading">
                QuizAI
              </span>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="w-full max-w-xs h-px bg-border/40" />

            {/* Copyright */}
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} QuizAI. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
