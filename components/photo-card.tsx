"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import type { PhotoMoment } from "@/lib/types";

export function PhotoCard({ photo }: { photo: PhotoMoment }) {
  const imageUrl = photo.thumbnail_url || photo.image_url;
  const [isLoaded, setIsLoaded] = useState(false);
  const [likesCount, setLikesCount] = useState(photo.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasLiked(!!localStorage.getItem(`js-wedding-liked-photo-${photo.id}`));
    }
  }, [photo.id]);

  const handleLike = async () => {
    if (isLiking) return;

    const willUnlike = hasLiked;
    setIsLiking(true);

    // Optimistic UI updates
    setLikesCount((prev) => Math.max(0, willUnlike ? prev - 1 : prev + 1));
    setHasLiked(!willUnlike);

    // Spawn floating hearts if liking
    if (!willUnlike) {
      const newHearts = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        left: Math.random() * 30 - 15 // random range between -15px and +15px
      }));
      setFloatingHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 1200);
    }

    try {
      if (willUnlike) {
        localStorage.removeItem(`js-wedding-liked-photo-${photo.id}`);
      } else {
        localStorage.setItem(`js-wedding-liked-photo-${photo.id}`, "true");
      }

      const res = await fetch("/api/photos/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photo.id, unlike: willUnlike })
      });

      if (res.ok) {
        const data = (await res.json()) as { likes_count: number };
        setLikesCount(data.likes_count);
      }
    } catch (err) {
      console.error("Failed to submit photo like status change:", err);
      // Revert optimistic state on error
      setLikesCount((prev) => (willUnlike ? prev + 1 : Math.max(0, prev - 1)));
      setHasLiked(willUnlike);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="glass-card rounded-card overflow-hidden group shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white/80">
      <div className="relative overflow-hidden bg-camel-pale/35 min-h-[140px]">
        {/* Subtle loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-tweed/30 border-t-transparent" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt={photo.caption || `Wedding moment shared by ${photo.guest_name}`}
          className={`w-full h-auto object-contain block transition-all duration-700 ease-out group-hover:scale-102 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-tweed/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-tweed">
            {photo.category || "Moment"}
          </span>
        </div>
        {photo.caption ? (
          <p className="mt-3 font-sans text-sm leading-relaxed text-navy/85">{photo.caption}</p>
        ) : null}
        <div className="mt-5 flex items-center justify-between border-t border-ash-pale/40 pt-4 text-[11px] text-navy/60">
          <p className="font-medium">Shared by <span className="font-semibold text-navy/80">{photo.guest_name}</span></p>
          <div className="relative">
            {floatingHearts.map((heart) => (
              <span
                key={heart.id}
                className="floating-heart text-[10px] select-none"
                style={{ left: `calc(50% + ${heart.left}px)`, bottom: "120%" }}
              >
                ❤️
              </span>
            ))}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`group flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-all duration-300 active:scale-95 ${
                hasLiked
                  ? "text-rose-600 bg-rose-50 border border-rose-100/60 shadow-sm"
                  : "text-navy/55 border border-transparent hover:border-camel-pale hover:bg-camel-pale/30 hover:text-navy"
              }`}
              aria-label="Like photo"
            >
              <Heart
                className={`h-3.5 w-3.5 transition-all duration-300 group-hover:scale-110 ${
                  hasLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-current"
                }`}
              />
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
