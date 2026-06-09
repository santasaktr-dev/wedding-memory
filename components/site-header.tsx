"use client";

import { Camera, Feather, Globe2, Home, Images, MessageSquareText, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/lib/i18n";

type NavItem = { href: string; labelKey: TranslationKey; icon: LucideIcon };

const navItems: NavItem[] = [
  { href: "/write", labelKey: "nav.write", icon: Feather },
  { href: "/wall", labelKey: "nav.wall", icon: MessageSquareText },
  { href: "/upload", labelKey: "nav.upload", icon: Camera },
  { href: "/gallery", labelKey: "nav.gallery", icon: Images }
];

const mobileNavItems: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: Home },
  ...navItems
];

export function SiteHeader() {
  const pathname = usePathname();
  const { language, t, toggleLanguage } = useLanguage();

  if (pathname === "/live") return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ash-pale/80 bg-ivory/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="font-serif text-2xl font-semibold text-navy">
            J&amp;S
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <nav aria-label="Main navigation" className="hidden items-center gap-1 text-sm sm:flex">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-2 transition ${
                      active
                        ? "bg-camel-pale text-navy"
                        : "text-navy/78 hover:bg-camel-pale hover:text-navy"
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-tweed/30 bg-ivory-warm px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy shadow-sm transition hover:bg-camel-pale"
              aria-label="Switch language"
            >
              <Globe2 className="h-3.5 w-3.5" />
              <span>{language === "en" ? "TH" : "EN"}</span>
            </button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-navy/12 bg-ivory-warm px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2 shadow-[0_-14px_34px_rgba(10,31,68,0.18)] sm:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[8px] bg-ivory-warm">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[3.35rem] flex-col items-center justify-center gap-1 rounded-[8px] px-1 text-[10px] font-semibold transition active:scale-[0.97] ${
                  active
                    ? "bg-navy text-ivory-warm shadow-sm"
                    : "text-navy/72 hover:bg-camel-pale/70 hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="leading-none">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
