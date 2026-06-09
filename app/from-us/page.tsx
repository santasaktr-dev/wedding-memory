"use client";

import { PageShell } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";

export default function FromUsPage() {
  const { t } = useLanguage();

  return (
    <PageShell
      eyebrow="From Jajah & Smart"
      title="A Note of Thanks"
      intro="A small letter for the family and friends who made this day feel full."
      eyebrowKey="fromUs.eyebrow"
      titleKey="fromUs.title"
      introKey="fromUs.intro"
    >
      <article className="paper-frame max-w-3xl rounded-card border border-tweed/25 bg-ivory-warm p-7 shadow-card sm:p-10">
        <div className="space-y-5 text-base leading-8 text-navy/75">
          <p>{t("fromUs.greeting")}</p>
          <p>{t("fromUs.line1")}</p>
          <p>{t("fromUs.line2")}</p>
          <p>{t("fromUs.closing")}</p>
        </div>
        <p className="mt-8 font-serif text-4xl text-navy">Jajah &amp; Smart</p>
      </article>
    </PageShell>
  );
}
