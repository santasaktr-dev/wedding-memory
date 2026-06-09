"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function SiteFooter() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide the footer on the live presentation projector page
  if (pathname === "/live") return null;

  return (
    <footer className="relative mt-auto border-t border-ash-pale/40 bg-gradient-to-b from-ivory-warm/40 to-ivory/90 py-12 backdrop-blur-md">
      {/* Decorative Top Flourish */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-[#f8f5ef] px-4">
        <div className="h-[1px] w-8 bg-tweed/30"></div>
        <Heart className="mx-2 h-3 w-3 text-tweed-soft/70 fill-current animate-pulse" />
        <div className="h-[1px] w-8 bg-tweed/30"></div>
      </div>

      <div className="mx-auto max-w-5xl px-6 flex flex-col items-center">
        {/* Monogram or Brand Signature */}
        <div className="text-center mb-6">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wider text-navy hover:text-tweed transition-colors duration-300">
            J&amp;S
          </Link>
          <p className="font-serif italic text-xs text-tweed-soft mt-1">
            “{t("footer.thanks")}”
          </p>
        </div>

        {/* Elegant Navigation Links */}
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8 text-xs tracking-wider font-semibold text-navy/70 uppercase">
          <Link href="/write" className="hover:text-tweed hover:-translate-y-0.5 transition-all duration-300">
            {t("footer.write")}
          </Link>
          <span className="text-ash/60 text-[10px] hidden sm:inline">•</span>
          <Link href="/wall" className="hover:text-tweed hover:-translate-y-0.5 transition-all duration-300">
            {t("footer.wall")}
          </Link>
          <span className="text-ash/60 text-[10px] hidden sm:inline">•</span>
          <Link href="/upload" className="hover:text-tweed hover:-translate-y-0.5 transition-all duration-300">
            {t("footer.upload")}
          </Link>
          <span className="text-ash/60 text-[10px] hidden sm:inline">•</span>
          <Link href="/gallery" className="hover:text-tweed hover:-translate-y-0.5 transition-all duration-300">
            {t("footer.gallery")}
          </Link>
          <span className="text-ash/60 text-[10px] hidden sm:inline">•</span>
          <Link href="/from-us" className="hover:text-tweed hover:-translate-y-0.5 transition-all duration-300 text-tweed font-bold">
            {t("footer.fromUs")}
          </Link>
        </nav>

        {/* Info & Date Details */}
        <div className="text-center space-y-1.5 text-[11px] tracking-widest text-navy/50 font-medium uppercase border-t border-ash-pale/30 pt-6 w-full max-w-md">
          <p className="font-serif font-bold text-tweed text-[12px] normal-case tracking-normal">
            Jajah &amp; Smart
          </p>
          <p>{t("common.date")}</p>
          <p className="text-[10px] text-navy/40 mt-3 normal-case tracking-normal font-sans font-light">
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
