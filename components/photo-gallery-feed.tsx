"use client";

import { useEffect, useMemo, useState } from "react";
import { PhotoCard } from "@/components/photo-card";
import { useLanguage } from "@/components/language-provider";
import { photoCategories } from "@/lib/types";
import type { PhotoCategory, PhotoMoment } from "@/lib/types";

const cacheKey = "js-wedding-visible-photos";
const recentKey = "js-wedding-recent-photos";

function readStoredPhotos(key: string) {
  if (typeof window === "undefined") return [];

  try {
    return (JSON.parse(window.sessionStorage.getItem(key) || "[]") as PhotoMoment[]).filter(
      (photo) =>
        photo.status === "approved" &&
        Date.now() - new Date(photo.created_at).getTime() < 15 * 60 * 1000
    );
  } catch {
    return [];
  }
}

function mergePhotos(primary: PhotoMoment[], secondary: PhotoMoment[]) {
  const seen = new Set<string>();
  const result: PhotoMoment[] = [];
  const all = [...primary, ...secondary];

  all.forEach((photo) => {
    const dupKey = photo.id || `${photo.guest_name}-${photo.image_url}`;
    if (seen.has(dupKey)) return;
    seen.add(dupKey);
    result.push(photo);
  });

  return result;
}

function PhotoSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-tweed/15 bg-ivory-warm shadow-card">
      <div className="aspect-[4/5] bg-camel-pale" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-32 rounded-full bg-camel-pale" />
        <div className="h-4 w-10/12 rounded-full bg-ash-pale/70" />
        <div className="h-3 w-24 rounded-full bg-ash-pale/70" />
      </div>
    </div>
  );
}

export function PhotoGalleryFeed() {
  const { t, tPhotoCategory } = useLanguage();
  const [photos, setPhotos] = useState<PhotoMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const cached = readStoredPhotos(cacheKey);
    const recent = readStoredPhotos(recentKey);
    const immediate = mergePhotos(recent, cached);

    if (immediate.length) {
      setPhotos(immediate);
      setLoading(false);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    fetch("/api/gallery", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("Could not load photos");
        return (await response.json()) as { photos: PhotoMoment[] };
      })
      .then((data) => {
        const nextPhotos = mergePhotos(readStoredPhotos(recentKey), data.photos || []);
        setPhotos(nextPhotos);
        window.sessionStorage.setItem(cacheKey, JSON.stringify(data.photos || []));
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.warn("Photos fetch aborted or failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === "All") return photos;
    return photos.filter((photo) => photo.category === selectedCategory);
  }, [photos, selectedCategory]);

  const tabs: Array<"All" | PhotoCategory> = ["All", ...photoCategories];
  const skeletons = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skeletons.map((item) => (
          <PhotoSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div className="rounded-card border border-tweed/20 bg-ivory-warm p-8 text-navy/70 shadow-card">
        {t("gallery.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        {tabs.map((tab) => {
          const active = selectedCategory === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedCategory(tab)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 border ${
                active
                  ? "border-tweed bg-tweed text-ivory-warm shadow-sm scale-102"
                  : "border-tweed/20 bg-ivory-warm/40 text-navy/70 hover:border-tweed/50 hover:bg-ivory-warm"
              }`}
            >
              {tab === "All" ? t("gallery.all") : tPhotoCategory(tab)}
            </button>
          );
        })}
      </div>

      {filteredPhotos.length ? (
        <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="break-inside-avoid mb-5">
              <PhotoCard photo={photo} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-tweed/15 bg-ivory-warm/50 p-8 text-center text-sm text-navy/60">
          {t("gallery.none")}
        </div>
      )}
    </div>
  );
}
