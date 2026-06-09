"use client";

import { ArrowRight, Camera, Feather, Heart, Images, MessageSquareText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import type { PhotoMoment, Wish } from "@/lib/types";

export function HomePageContent({
  featuredWish,
  galleryImage,
  heroImage
}: {
  featuredWish: Wish | null;
  galleryImage: PhotoMoment | undefined;
  heroImage: PhotoMoment | undefined;
}) {
  const { t } = useLanguage();

  return (
    <section className="mx-auto min-h-[calc(100vh-145px)] max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:items-center">
        <div className="paper-frame rounded-[8px] border border-white/60 bg-ivory-warm/78 px-5 py-8 shadow-card backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-tweed">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-tweed/30 bg-ivory font-serif text-base normal-case tracking-normal text-tweed">
              J&amp;S
            </span>
            <span>{t("common.weddingMemory")}</span>
          </div>

          <h1 className="mt-7 max-w-3xl font-serif text-[3.25rem] font-semibold leading-[0.9] text-navy sm:text-7xl lg:text-8xl">
            {t("home.title")}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-navy/72 sm:text-lg">
            {t("home.intro")}
          </p>

          <div className="mt-7 grid gap-3 sm:max-w-xl sm:grid-cols-[1fr_auto]">
            <Link
              href="/write"
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-[8px] border border-navy bg-navy px-5 py-4 text-sm font-semibold text-ivory-warm shadow-md transition hover:bg-navy-soft active:scale-[0.98]"
            >
              <Feather className="h-5 w-5" />
              {t("home.write")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[8px] border border-tweed/45 bg-ivory px-5 py-4 text-sm font-semibold text-navy transition hover:bg-camel-pale active:scale-[0.98]"
            >
              <Camera className="h-5 w-5 text-tweed" />
              {t("home.upload")}
            </Link>
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-ash-pale/70 pt-5 text-xs font-semibold uppercase tracking-[0.2em] text-tweed sm:flex-row sm:items-center sm:justify-between">
            <p>{t("common.date")}</p>
            <p className="text-navy/55">{t("common.venue")}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="relative min-h-[330px] overflow-hidden rounded-[8px] border border-white/70 bg-navy shadow-card sm:min-h-[420px]">
            {heroImage ? (
              <Image
                src={heroImage.image_url}
                alt={heroImage.caption || "Wedding ceremony moment"}
                fill
                priority
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,31,68,0.94),rgba(124,92,59,0.72))]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/78 via-navy/18 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-ivory-warm sm:p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-2 text-xs font-semibold backdrop-blur">
                <Heart className="h-4 w-4 fill-ivory-warm/80" />
                {t("home.wallBadge")}
              </div>
              <p className="max-w-sm font-serif text-3xl font-semibold leading-none sm:text-4xl">
                {t("home.wallTitle")}
              </p>
              <Link
                href="/wall"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ivory-warm underline-offset-4 hover:underline"
              >
                {t("home.viewWall")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
            <Link
              href="/gallery"
              className="group overflow-hidden rounded-[8px] border border-white/65 bg-ivory-warm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            >
              <div className="relative h-48 overflow-hidden bg-camel-pale sm:h-44">
                {galleryImage ? (
                  <Image
                    src={galleryImage.image_url}
                    alt={galleryImage.caption || "Wedding reception detail"}
                    fill
                    sizes="(min-width: 640px) 38vw, 100vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-camel-pale/70 text-sm font-semibold text-navy/45">
                    {t("home.galleryClosed")}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tweed">
                    {t("home.gallery")}
                  </p>
                  <p className="mt-1 font-serif text-xl font-semibold text-navy">
                    {t("home.galleryTitle")}
                  </p>
                </div>
                <Images className="h-5 w-5 shrink-0 text-tweed" />
              </div>
            </Link>

            <Link
              href="/wall"
              className="rounded-[8px] border border-white/65 bg-white/62 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-camel-pale text-navy">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <p className="font-serif text-2xl font-semibold leading-tight text-navy">
                {featuredWish ? `“${featuredWish.message}”` : t("home.emptyWish")}
              </p>
              <p className="mt-4 text-sm font-semibold text-tweed">
                {featuredWish ? featuredWish.guest_name : t("home.emptyWishCta")}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
