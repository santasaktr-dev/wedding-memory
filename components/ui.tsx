"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/lib/i18n";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
};

const buttonStyles = {
  primary: "border-navy bg-navy text-ivory-warm hover:bg-navy-soft",
  secondary: "border-tweed/55 bg-ivory-warm text-navy hover:bg-camel-pale",
  ghost: "border-transparent bg-transparent text-navy hover:bg-camel-pale"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-12 items-center justify-center rounded-card border px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:scale-100",
        buttonStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: ButtonProps["variant"] }) {
  return (
    <Link
      className={clsx(
        "inline-flex min-h-12 items-center justify-center rounded-card border px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
        buttonStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function PageShell({
  children,
  eyebrow,
  title,
  intro,
  eyebrowKey,
  titleKey,
  introKey
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  intro?: string;
  eyebrowKey?: TranslationKey;
  titleKey?: TranslationKey;
  introKey?: TranslationKey;
}) {
  const { t } = useLanguage();
  const displayEyebrow = eyebrowKey ? t(eyebrowKey) : eyebrow;
  const displayTitle = titleKey ? t(titleKey) : title;
  const displayIntro = introKey ? t(introKey) : intro;

  return (
    <section className="mx-auto min-h-[calc(100vh-145px)] max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-3xl">
        {displayEyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-tweed">
            {displayEyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-5xl font-semibold leading-none sm:text-6xl bg-gradient-to-r from-navy via-tweed to-tweed-soft bg-clip-text text-transparent py-1">
          {displayTitle}
        </h1>
        {displayIntro ? <p className="mt-4 text-base leading-7 text-navy/70">{displayIntro}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
  note
}: {
  label: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-navy/90">
      <span>{label}</span>
      {children}
      {note ? <span className="text-xs font-normal text-navy/50">{note}</span> : null}
    </label>
  );
}

export const inputClass =
  "min-h-12 rounded-card border border-ash-pale/85 bg-ivory-warm/80 px-4 py-3 text-navy outline-none transition-all duration-300 placeholder:text-navy/30 focus:border-tweed focus:bg-ivory-warm focus:shadow-sm focus:ring-2 focus:ring-camel/30";

export function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    hidden: "border-rose-200 bg-rose-50 text-rose-700",
    deleted: "border-zinc-200 bg-zinc-100 text-zinc-600"
  };

  const statusLabels: Record<string, string> = {
    approved: "Approved",
    pending: "Pending",
    hidden: "Blocked",
    deleted: "Deleted"
  };

  return (
    <span
      className={clsx(
        "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
        statusStyles[status] || "border-tweed/35 bg-camel-pale text-navy"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
