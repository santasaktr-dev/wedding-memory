"use client";

import { useEffect, useMemo, useState } from "react";
import { WishCard } from "@/components/wish-card";
import { useLanguage } from "@/components/language-provider";
import { wishTypes } from "@/lib/types";
import type { Wish, WishType } from "@/lib/types";

const cacheKey = "js-wedding-visible-wishes";
const recentKey = "js-wedding-recent-wishes";

function readStoredWishes(key: string) {
  if (typeof window === "undefined") return [];

  try {
    return (JSON.parse(window.sessionStorage.getItem(key) || "[]") as Wish[]).filter(
      (wish) =>
        wish.status === "approved" &&
        Date.now() - new Date(wish.created_at).getTime() < 15 * 60 * 1000
    );
  } catch {
    return [];
  }
}

function mergeWishes(primary: Wish[], secondary: Wish[]) {
  const seen = new Set<string>();
  const result: Wish[] = [];
  const all = [...primary, ...secondary];

  all.forEach((wish) => {
    const sig = `${wish.guest_name}-${wish.message}`;
    const dupKey = wish.id || sig;
    if (seen.has(dupKey)) return;
    seen.add(dupKey);
    result.push(wish);
  });

  return result;
}

function WishSkeleton() {
  return (
    <div className="break-inside-avoid rounded-card border border-tweed/15 bg-ivory-warm p-5 shadow-card">
      <div className="mb-5 h-3 w-28 rounded-full bg-camel-pale" />
      <div className="space-y-3">
        <div className="h-5 w-11/12 rounded-full bg-ash-pale/70" />
        <div className="h-5 w-8/12 rounded-full bg-ash-pale/70" />
      </div>
      <div className="mt-6 h-px bg-ash-pale" />
      <div className="mt-4 h-3 w-24 rounded-full bg-camel-pale" />
    </div>
  );
}

export function MemoryWallFeed() {
  const { t, tWishType } = useLanguage();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("All");

  useEffect(() => {
    const cached = readStoredWishes(cacheKey);
    const recent = readStoredWishes(recentKey);
    const immediate = mergeWishes(recent, cached);

    if (immediate.length) {
      setWishes(immediate);
      setLoading(false);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch(`/api/wall?fresh=${Date.now()}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("Could not load wishes");
        return (await response.json()) as { wishes: Wish[] };
      })
      .then((data) => {
        const nextWishes = mergeWishes(readStoredWishes(recentKey), data.wishes || []);
        setWishes(nextWishes);
        window.sessionStorage.setItem(cacheKey, JSON.stringify(data.wishes || []));
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.warn("Wishes fetch aborted or failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredWishes = useMemo(() => {
    if (selectedType === "All") return wishes;
    return wishes.filter((wish) => wish.message_type === selectedType);
  }, [wishes, selectedType]);

  const tabs: Array<"All" | WishType> = ["All", ...wishTypes];
  const skeletons = useMemo(() => Array.from({ length: 3 }, (_, index) => index), []);

  if (loading) {
    return (
      <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
        {skeletons.map((item) => (
          <WishSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (!wishes.length) {
    return (
      <div className="rounded-card border border-tweed/20 bg-ivory-warm p-8 text-navy/70 shadow-card">
        {t("wall.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        {tabs.map((tab) => {
          const active = selectedType === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedType(tab)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 border ${
                active
                  ? "border-tweed bg-tweed text-ivory-warm shadow-sm scale-102"
                  : "border-tweed/20 bg-ivory-warm/40 text-navy/70 hover:border-tweed/50 hover:bg-ivory-warm"
              }`}
            >
              {tab === "All" ? t("wall.all") : tWishType(tab)}
            </button>
          );
        })}
      </div>

      {filteredWishes.length ? (
        <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
          {filteredWishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-tweed/15 bg-ivory-warm/50 p-8 text-center text-sm text-navy/60">
          {t("wall.none")}
        </div>
      )}
    </div>
  );
}
