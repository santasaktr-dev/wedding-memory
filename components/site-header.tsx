"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/write", label: "Write" },
  { href: "/wall", label: "Wall" },
  { href: "/upload", label: "Upload" },
  { href: "/gallery", label: "Gallery" }
];

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/live") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-ash-pale/80 bg-ivory/92 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-serif text-2xl font-semibold text-navy">
          J&amp;S
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-navy/78 transition hover:bg-camel-pale hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
