"use client";

import { useEffect, useState } from "react";
import { Heart, MessageSquare, Image as ImageIcon, Sparkles } from "lucide-react";
import type { Wish, PhotoMoment } from "@/lib/types";

type ProjectorItem = {
  id: string;
  guest_name: string;
  relationship?: string | null;
  table_number?: string | null;
  message_type?: string;
  message?: string;
  caption?: string | null;
  category?: string;
  image_url?: string;
  type: "wish" | "photo";
  likes_count: number;
  created_at: string;
};

function extractKeywords(wishes: ProjectorItem[]) {
  // Define normalized representations of keywords to capture and group
  const keywordsConfig = [
    // Core Words
    { term: "รักกันนานๆ", matches: ["รักกันนานๆ", "รักกันนาน ๆ", "รักกันนานๆนะ"] },
    { term: "รัก", matches: ["รัก", "รักแท้", "love", "lovely", "love you"] },
    { term: "ยินดีด้วย", matches: ["ยินดีด้วย", "ยินดีด้วยนะ", "ขอแสดงความยินดี", "congrats", "congratulations", "congrat"] },
    { term: "มีความสุข", matches: ["มีความสุข", "มีความสุขมากๆ", "มีความสุขมาก ๆ", "happy", "happiness"] },
    { term: "ตลอดไป", matches: ["ตลอดไป", "ตลอดกาล", "forever"] },
    { term: "เคียงข้าง", matches: ["เคียงข้าง", "ดูแลกัน", "together"] },
    { term: "ครอบครัว", matches: ["ครอบครัว", "family"] },
    { term: "อบอุ่น", matches: ["อบอุ่น", "อบอุ่นมาก", "warm"] },
    { term: "คู่แท้", matches: ["คู่แท้", "soulmate"] },
    { term: "สมหวัง", matches: ["สมหวัง", "โชคดี", "blessed", "joy"] },
    { term: "ชีวิตคู่", matches: ["ชีวิตคู่", "คู่ชีวิต", "ครองรัก", "marriage", "married"] },
    
    // Warm Sentiment Words
    { term: "น่ารัก", matches: ["น่ารัก", "น่ารักมาก", "lovely", "cute"] },
    { term: "สวยงาม", matches: ["สวยงาม", "งดงาม", "beautiful", "gorgeous"] },
    { term: "ประทับใจ", matches: ["ประทับใจ", "elegant", "timeless"] },
    { term: "รอยยิ้ม", matches: ["รอยยิ้ม", "เสียงหัวเราะ", "smile", "laughter"] },
    { term: "ชื่นมื่น", matches: ["ชื่นมื่น", "เจริญรุ่งเรือง", "มั่นคง"] },
    { term: "หวาน", matches: ["หวาน", "หวานใจ", "sweet"] },
    
    // Wedding-Specific Words
    { term: "เจ้าบ่าว", matches: ["เจ้าบ่าว", "groom"] },
    { term: "เจ้าสาว", matches: ["เจ้าสาว", "bride"] },
    { term: "บ่าวสาว", matches: ["บ่าวสาว", "คู่บ่าวสาว", "couple"] },
    { term: "งานแต่ง", matches: ["งานแต่ง", "แต่งงาน", "wedding"] },
    { term: "Jajah", matches: ["jajah", "จ๋า"] },
    { term: "Smart", matches: ["smart", "สมาร์ท"] }
  ];

  const counts: Record<string, number> = {};
  
  wishes.forEach(item => {
    if (item.type === "wish" && item.message) {
      let text = item.message.toLowerCase();
      
      // Check each category of matches
      keywordsConfig.forEach(({ term, matches }) => {
        // Sort matches by length descending to match longer strings first
        const sortedMatches = [...matches].sort((a, b) => b.length - a.length);
        
        for (const match of sortedMatches) {
          const matchLower = match.toLowerCase();
          if (text.includes(matchLower)) {
            // Count this term
            const keyName = term;
            counts[keyName] = (counts[keyName] || 0) + 1;
            
            // Remove the matched word from the text to prevent matching shorter substrings
            text = text.replace(matchLower, "");
            break; // Move to the next config item
          }
        }
      });
    }
  });

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
}

export default function LiveProjectorPage() {
  const [items, setItems] = useState<ProjectorItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"slideshow" | "cloud">("slideshow");
  const [newToast, setNewToast] = useState<{
    guestName: string;
    type: "wish" | "photo";
    message: string;
    tableNumber: string | null;
  } | null>(null);

  // Fetch wishes and photos
  useEffect(() => {
    async function fetchFeed() {
      try {
        const [wishesRes, photosRes] = await Promise.all([
          fetch("/api/wall", { cache: "no-store" }),
          fetch("/api/gallery", { cache: "no-store" })
        ]);

        if (wishesRes.ok && photosRes.ok) {
          const wishesData = (await wishesRes.json()) as { wishes: Wish[] };
          const photosData = (await photosRes.json()) as { photos: PhotoMoment[] };

          const combined: ProjectorItem[] = [
            ...(wishesData.wishes || []).map((w) => ({ ...w, type: "wish" as const })),
            ...(photosData.photos || []).map((p) => ({ ...p, type: "photo" as const }))
          ];

          combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          setItems((prev) => {
            if (prev.length > 0 && combined.length > 0) {
              const newItems = combined.filter((newItem) => !prev.some((oldItem) => oldItem.id === newItem.id));
              if (newItems.length > 0) {
                const mostRecent = newItems[0];
                setNewToast({
                  guestName: mostRecent.guest_name,
                  type: mostRecent.type,
                  message: mostRecent.type === "wish" ? "shared a new wish!" : "uploaded a new photo!",
                  tableNumber: mostRecent.table_number || null
                });
                setTimeout(() => setNewToast(null), 6000);
              }
            }
            return combined;
          });
        }
      } catch (err) {
        console.error("Failed to load projector feed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
    const interval = setInterval(fetchFeed, 20000);
    return () => clearInterval(interval);
  }, []);

  // Slide loop timer
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (loading && !items.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory text-navy">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-tweed border-t-transparent" />
        <p className="mt-4 font-serif text-lg tracking-wider text-tweed">Preparing Live Slideshow...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory text-navy p-6 text-center">
        <MessageSquare className="h-16 w-16 text-tweed/40 mb-4" />
        <h1 className="font-serif text-3xl font-semibold mb-2">Memory Wall Live</h1>
        <p className="max-w-md text-navy/60">Waiting for guest submissions. Send your first wish or photo to display here!</p>
      </div>
    );
  }


  const activeKeywords = extractKeywords(items);
  
  const defaultWords = [
    { word: "ยินดีด้วย", count: 1 },
    { word: "รักกันนานๆ", count: 1 },
    { word: "มีความสุข", count: 1 },
    { word: "ตลอดไป", count: 1 },
    { word: "เคียงข้าง", count: 1 },
    { word: "ดูแลกัน", count: 1 },
    { word: "อบอุ่น", count: 1 },
    { word: "รักแท้", count: 1 },
    { word: "สมหวัง", count: 1 },
    { word: "โชคดี", count: 1 },
    { word: "ชื่นมื่น", count: 1 },
    { word: "ครอบครัว", count: 1 },
    { word: "คู่แท้", count: 1 },
    { word: "เคียงคู่", count: 1 },
    { word: "หวานใจ", count: 1 },
    { word: "สวยงาม", count: 1 },
    { word: "Happy", count: 1 },
    { word: "Love", count: 1 },
    { word: "Forever", count: 1 },
    { word: "Congrats", count: 1 },
    { word: "Together", count: 1 },
    { word: "Always", count: 1 },
    { word: "Perfect", count: 1 },
    { word: "Blessed", count: 1 },
    { word: "Joy", count: 1 },
    { word: "Best Wishes", count: 1 },
    { word: "Wedding Day", count: 1 },
    { word: "J&S", count: 1 }
  ];

  const mergedKeywords = [...activeKeywords.map(k => ({ ...k, isDefault: false }))];
  defaultWords.forEach(def => {
    if (!mergedKeywords.some(k => k.word === def.word)) {
      mergedKeywords.push({ ...def, isDefault: true });
    }
  });

  const displayKeywords = mergedKeywords.slice(0, 28);

  return (
    <main className="relative flex min-h-screen w-screen overflow-hidden bg-gradient-to-br from-ivory to-camel-pale/30 text-navy transition-all duration-1000">
      
      {/* Floating View Switcher Tab Bar at top center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full border border-white/60 bg-white/75 backdrop-blur-md p-1 shadow-md hover:shadow-lg transition-all duration-300">
        <button
          onClick={() => setViewMode("slideshow")}
          className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full tracking-wider transition-all duration-300 ${
            viewMode === "slideshow"
              ? "bg-navy text-ivory-warm shadow"
              : "text-navy/60 hover:bg-camel-pale/30"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Slideshow</span>
        </button>
        <button
          onClick={() => setViewMode("cloud")}
          className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full tracking-wider transition-all duration-300 ${
            viewMode === "cloud"
              ? "bg-navy text-ivory-warm shadow"
              : "text-navy/60 hover:bg-camel-pale/30"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Word Cloud</span>
        </button>
      </div>

      {/* Decorative header */}
      <div className="absolute left-10 top-8 z-10 flex items-center gap-3 select-none">
        <div className="rounded-full bg-tweed/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-tweed">
          Live Memory Wall
        </div>
        <p className="text-sm font-semibold tracking-wider text-navy/55">Jajah &amp; Smart</p>
      </div>

      {viewMode === "slideshow" && (
        <div className="absolute right-10 top-8 z-10 text-xs font-semibold tracking-[0.16em] text-navy/40 select-none">
          Slide {activeIndex + 1} of {items.length}
        </div>
      )}

      {/* Content Area */}
      <div className="flex w-full items-center justify-center px-8 py-24 md:px-16 lg:px-24">
        
        {/* Mode 1: Slideshow View */}
        {viewMode === "slideshow" && (
          <div className="flex-grow flex items-center justify-center w-full max-w-6xl mx-auto">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              if (!isActive) return null;

              return (
                <div
                  key={item.id}
                  className="flex h-full max-h-[85vh] w-full max-w-5xl transform flex-col items-center justify-center transition-all duration-700 animate-scale-up"
                >
                  {item.type === "wish" ? (
                    /* Wish Card Layout - Elegant Minimalist Board */
                    <div className="relative flex flex-col justify-between rounded-card border border-white/50 bg-white/70 backdrop-blur-lg p-12 shadow-2xl w-full max-w-4xl min-h-[420px] text-center">
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-navy p-4 text-ivory-warm shadow-lg">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div className="mt-10 flex flex-col justify-center flex-grow">
                        <span className="font-serif text-8xl text-tweed/10 leading-none mb-1 select-none">&ldquo;</span>
                        <p className="font-serif text-3xl leading-relaxed text-navy md:text-4xl lg:text-5xl px-6 md:px-12 animate-fade-in-up">
                          {item.message}
                        </p>
                        <span className="font-serif text-8xl text-tweed/10 leading-none mt-1 select-none">&rdquo;</span>
                      </div>
                      <div className="mt-8 flex flex-col items-center justify-center">
                        <p className="text-xl font-bold bg-gradient-to-r from-navy to-tweed bg-clip-text text-transparent">— {item.guest_name}</p>
                        {item.relationship || item.table_number ? (
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy/40">
                            {item.relationship} {item.table_number ? `· Table ${item.table_number}` : ""}
                          </p>
                        ) : null}
                        {item.likes_count > 0 && (
                          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100/50 px-3.5 py-1 rounded-full shadow-sm">
                            <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
                            <span>{item.likes_count} Loves</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Photo Card Layout - Elegant Split Screen Album */
                    <div className="grid h-full w-full grid-cols-1 overflow-hidden rounded-card border border-white/50 bg-white/75 backdrop-blur-lg shadow-2xl md:grid-cols-2">
                      {/* Image pane */}
                      <div className="relative overflow-hidden flex items-center justify-center bg-camel-pale/10 p-4 min-h-[350px] md:h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.caption || "Shared moment"}
                          className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-lg animate-ken-burns z-10"
                        />
                        <div className="absolute top-6 left-6 rounded-full bg-navy p-3 text-ivory-warm shadow-lg z-20">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      </div>
                      {/* Photo details pane */}
                      <div className="flex flex-col justify-between p-10 md:p-16 lg:p-20 bg-ivory-warm/40">
                        <div className="animate-fade-in-up">
                          <span className="rounded-full bg-tweed/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-tweed">
                            {item.category || "Couple Moment"}
                          </span>
                          <h2 className="mt-8 font-serif text-3xl leading-relaxed text-navy md:text-4xl lg:text-5xl font-semibold">
                            {item.caption ? `“${item.caption}”` : "Shared a beautiful moment!"}
                          </h2>
                        </div>
                        <div className="mt-10 border-t border-ash-pale/50 pt-8 animate-fade-in-up">
                          <p className="text-xl font-bold bg-gradient-to-r from-navy to-tweed bg-clip-text text-transparent">— {item.guest_name}</p>
                          {item.table_number && (
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy/40">
                              Table {item.table_number}
                            </p>
                          )}
                          {item.likes_count > 0 && (
                            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100/50 px-3.5 py-1 rounded-full shadow-sm">
                              <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
                              <span>{item.likes_count} Loves</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Mode 2: Fullscreen Word Cloud Mode */}
        {viewMode === "cloud" && (
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[70vh] relative animate-scale-up py-4 px-6">
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
              <span className="font-serif text-[140px] md:text-[230px] font-bold text-tweed/[0.04] tracking-[0.15em] leading-none">
                J&amp;S
              </span>
            </div>

            <div className="text-center z-10 mb-8 select-none">
              <div className="inline-flex items-center justify-center gap-2 border-b border-tweed/25 pb-3 mb-2.5">
                <Sparkles className="h-5 w-5 text-tweed-soft animate-pulse" />
                <h2 className="font-serif text-2xl font-bold tracking-widest text-navy uppercase">
                  คำอวยพรร่วมยินดี
                </h2>
              </div>
              <p className="text-[10px] tracking-widest text-navy/40 font-semibold uppercase">
                Live Blessing Word Cloud
              </p>
            </div>

            {/* Drifting Cloud Grid */}
            <div className="relative z-10 w-full flex flex-wrap items-center justify-center content-center gap-x-5 gap-y-7 max-w-5xl py-6 min-h-[350px]">
              {displayKeywords.map(({ word, count, isDefault }, index) => {
                let sizeClass = "text-xs px-3.5 py-1.5";
                if (index === 0) sizeClass = "text-[28px] md:text-[34px] px-6 py-3 font-bold font-serif";
                else if (index === 1) sizeClass = "text-[24px] md:text-[28px] px-5 py-2.5 font-bold font-serif";
                else if (index === 2) sizeClass = "text-[20px] md:text-[24px] px-5 py-2 font-semibold font-serif";
                else if (index < 6) sizeClass = "text-base md:text-lg px-5 py-2 font-semibold";
                else if (index < 12) sizeClass = "text-sm md:text-base px-4 py-2 font-medium";
                else if (index < 18) sizeClass = "text-xs md:text-sm px-3.5 py-1.5 font-medium";

                const delay = `${(index * 0.22).toFixed(2)}s`;
                const duration = `${(7.5 + (index % 4) * 1.5).toFixed(1)}s`;

                return (
                  <span
                    key={word}
                    className={`animate-float-drift hover:scale-110 transition-all duration-300 select-none rounded-full border shadow-sm ${sizeClass} ${
                      isDefault
                        ? "bg-white/20 border-ash-pale/25 text-navy/35 font-light"
                        : "bg-gradient-to-r from-tweed/10 to-camel-pale/20 border-tweed-soft/30 text-tweed font-semibold shadow-inner"
                    }`}
                    style={{
                      animationDelay: delay,
                      animationDuration: duration,
                    }}
                    title={isDefault ? "Blessing keyword" : `Wishes count: ${count}`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Real-time Toast Alert */}
      {newToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-white/60 bg-white/80 backdrop-blur-md px-6 py-3.5 shadow-2xl animate-scale-up border-t-tweed border-t-2">
          {newToast.type === "wish" ? (
            <Sparkles className="h-5 w-5 text-tweed" />
          ) : (
            <ImageIcon className="h-5 w-5 text-tweed" />
          )}
          <p className="text-sm font-semibold tracking-wider text-navy">
            <span className="text-tweed font-bold">{newToast.guestName}</span> 
            {newToast.tableNumber ? ` (Table ${newToast.tableNumber})` : ""} {newToast.message}
          </p>
        </div>
      )}
    </main>
  );
}
