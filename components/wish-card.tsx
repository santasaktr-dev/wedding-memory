"use client";

import { useEffect, useState } from "react";
import { Pin, Heart } from "lucide-react";
import type { Wish } from "@/lib/types";

export function WishCard({ wish }: { wish: Wish }) {
  const [likesCount, setLikesCount] = useState(wish.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasLiked(!!localStorage.getItem(`js-wedding-liked-wish-${wish.id}`));
    }
  }, [wish.id]);

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
        left: Math.random() * 40 - 20 // random range between -20px and +20px
      }));
      setFloatingHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 1200);
    }

    try {
      if (willUnlike) {
        localStorage.removeItem(`js-wedding-liked-wish-${wish.id}`);
      } else {
        localStorage.setItem(`js-wedding-liked-wish-${wish.id}`, "true");
      }

      const res = await fetch("/api/wishes/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: wish.id, unlike: willUnlike })
      });

      if (res.ok) {
        const data = (await res.json()) as { likes_count: number };
        setLikesCount(data.likes_count);
      }
    } catch (err) {
      console.error("Failed to submit wish like status change:", err);
      setLikesCount((prev) => (willUnlike ? prev + 1 : Math.max(0, prev - 1)));
      setHasLiked(willUnlike);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="break-inside-avoid glass-card rounded-card p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white/80">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-tweed/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-tweed">
          {wish.message_type}
        </span>
        {wish.is_pinned ? <Pin aria-label="Pinned wish" className="h-4 w-4 text-tweed-soft" /> : null}
      </div>
      <p className="font-serif text-2xl leading-relaxed text-navy">“{wish.message}”</p>
      <div className="mt-5 flex items-center justify-between border-t border-ash-pale/50 pt-4 text-sm text-navy/70">
        <div className="flex flex-col">
          <p className="font-semibold text-navy">— {wish.guest_name}</p>
          {wish.relationship && (
            <span className="text-[10px] uppercase tracking-wider text-navy/45 mt-0.5">
              {wish.relationship} {wish.table_number ? `· Table ${wish.table_number}` : ""}
            </span>
          )}
        </div>
        <div className="relative">
          {floatingHearts.map((heart) => (
            <span
              key={heart.id}
              className="floating-heart text-sm select-none"
              style={{ left: `calc(50% + ${heart.left}px)`, bottom: "120%" }}
            >
              ❤️
            </span>
          ))}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`group flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 active:scale-95 ${
              hasLiked
                ? "text-rose-600 bg-rose-50 border border-rose-100/60 shadow-sm"
                : "text-navy/55 border border-transparent hover:border-camel-pale hover:bg-camel-pale/30 hover:text-navy"
            }`}
            aria-label="Like wish"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 ${
                hasLiked ? "fill-rose-500 text-rose-500 scale-110 animate-pulse" : "text-current"
              }`}
            />
            <span>{likesCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

