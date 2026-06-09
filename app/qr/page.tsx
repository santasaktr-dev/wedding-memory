"use client";

import { ArrowRight, Camera, Feather, Images, MessageSquareText, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

type PrimaryAction = {
  href: string;
  titleKey: "qr.writeTitle" | "qr.uploadTitle";
  textKey: "qr.writeText" | "qr.uploadText";
  icon: LucideIcon;
};

const primaryActions: PrimaryAction[] = [
  {
    href: "/write",
    titleKey: "qr.writeTitle",
    textKey: "qr.writeText",
    icon: Feather
  },
  {
    href: "/upload",
    titleKey: "qr.uploadTitle",
    textKey: "qr.uploadText",
    icon: Camera
  }
];

export default function QrPage() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-145px)] max-w-3xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-14">
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-tweed">
          {t("qr.eyebrow")}
        </p>
        <h1 className="font-serif text-5xl font-semibold leading-none text-navy sm:text-6xl">
          {t("qr.title")}
        </h1>
        <p className="mt-4 text-base leading-7 text-navy/70 sm:text-lg">{t("qr.intro")}</p>
      </div>

      <div className="grid gap-4">
        {primaryActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group grid min-h-[8.5rem] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-card border border-white/60 bg-ivory-warm/82 p-5 shadow-card transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.98]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-navy text-ivory-warm">
                <Icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-xl font-semibold text-navy">{t(action.titleKey)}</span>
                <span className="mt-1 block text-sm leading-6 text-navy/62">{t(action.textKey)}</span>
              </span>
              <ArrowRight className="h-5 w-5 text-tweed transition group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/wall"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-tweed/40 bg-ivory-warm px-4 py-3 text-sm font-semibold text-navy transition hover:bg-camel-pale"
        >
          <MessageSquareText className="h-4 w-4 text-tweed" />
          {t("qr.viewWall")}
        </Link>
        <Link
          href="/gallery"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-tweed/40 bg-ivory-warm px-4 py-3 text-sm font-semibold text-navy transition hover:bg-camel-pale"
        >
          <Images className="h-4 w-4 text-tweed" />
          {t("qr.viewGallery")}
        </Link>
      </div>
    </section>
  );
}
