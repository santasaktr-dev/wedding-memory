"use client";

import { useEffect, useState } from "react";
import { Heart, Images, MessageSquare, Image as ImageIcon, Sparkles, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
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
  is_pinned?: boolean;
  created_at: string;
};

type LiveViewMode = "all" | "wishes" | "photos" | "cloud";

function projectorMessageClass(message = "") {
  const isThai = containsThai(message);

  if (message.length > 520) {
    return isThai
      ? "text-[clamp(1.35rem,2.1vw,2rem)] leading-[1.85]"
      : "text-xl leading-relaxed md:text-2xl lg:text-3xl";
  }

  if (message.length > 260) {
    return isThai
      ? "text-[clamp(1.65rem,2.5vw,2.75rem)] leading-[1.75]"
      : "text-2xl leading-relaxed md:text-3xl lg:text-4xl";
  }

  return isThai
    ? "text-[clamp(2rem,3vw,3.5rem)] leading-[1.58]"
    : "text-3xl leading-relaxed md:text-4xl lg:text-5xl";
}

function containsThai(value = "") {
  return /[\u0E00-\u0E7F]/.test(value);
}

function textFontClass(value = "") {
  return containsThai(value) ? "font-sans" : "font-serif";
}

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
  const { t } = useLanguage();
  const [items, setItems] = useState<ProjectorItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<LiveViewMode>("all");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [qrTarget, setQrTarget] = useState("");
  const [newToast, setNewToast] = useState<{
    guestName: string;
    type: "wish" | "photo";
    message: string;
    tableNumber: string | null;
  } | null>(null);

  useEffect(() => {
    setQrTarget(`${window.location.origin}/qr`);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function showControls() {
      setControlsVisible(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setControlsVisible(false), 3000);
    }

    showControls();
    window.addEventListener("mousemove", showControls);
    window.addEventListener("touchstart", showControls);
    window.addEventListener("keydown", showControls);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", showControls);
      window.removeEventListener("touchstart", showControls);
      window.removeEventListener("keydown", showControls);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function fetchFeed() {
      let nextDelay = 30000;

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

          if (!cancelled) {
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
        } else {
          nextDelay = 45000;
        }
      } catch (err) {
        console.error("Failed to load projector feed:", err);
        nextDelay = 60000;
      } finally {
        if (!cancelled) {
          setLoading(false);
          timeoutId = setTimeout(fetchFeed, nextDelay);
        }
      }
    }

    fetchFeed();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Slide loop timer
  useEffect(() => {
    const visibleItems = items.filter((item) => {
      if (viewMode === "wishes") return item.type === "wish";
      if (viewMode === "photos") return item.type === "photo";
      return viewMode !== "cloud";
    });
    if (visibleItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % visibleItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items, viewMode]);

  useEffect(() => {
    const visibleLength = items.filter((item) => {
      if (viewMode === "wishes") return item.type === "wish";
      if (viewMode === "photos") return item.type === "photo";
      return viewMode !== "cloud";
    }).length;
    setActiveIndex((currentIndex) => (visibleLength ? currentIndex % visibleLength : 0));
  }, [items, viewMode]);

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
  const visibleItems = items.filter((item) => {
    if (viewMode === "wishes") return item.type === "wish";
    if (viewMode === "photos") return item.type === "photo";
    return viewMode !== "cloud";
  });
  const activeItems =
    viewMode === "cloud"
      ? []
      : visibleItems.flatMap((item) => (item.is_pinned ? [item, { ...item, id: `${item.id}-pinned-repeat` }] : [item]));

  const modeButtons: Array<{
    mode: LiveViewMode;
    label: string;
    icon: LucideIcon;
  }> = [
    { mode: "all", label: t("live.modeAll"), icon: Sparkles },
    { mode: "wishes", label: t("live.modeWishes"), icon: MessageSquare },
    { mode: "photos", label: t("live.modePhotos"), icon: Images },
    { mode: "cloud", label: t("live.modeCloud"), icon: Sparkles }
  ];

  return (
    <main className="relative flex min-h-screen w-screen overflow-hidden bg-gradient-to-br from-ivory to-camel-pale/30 text-navy transition-all duration-1000">
      
      {/* Floating View Switcher Tab Bar at top center */}
      <div
        className={`absolute top-4 left-1/2 z-30 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-white/60 bg-white/75 p-1 shadow-md backdrop-blur-md transition-all duration-500 md:top-6 ${
          controlsVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        {modeButtons.map((button) => {
          const Icon = button.icon;

          return (
            <button
              key={button.mode}
              onClick={() => setViewMode(button.mode)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition-all duration-300 md:px-4 md:text-xs ${
                viewMode === button.mode
                  ? "bg-navy text-ivory-warm shadow"
                  : "text-navy/60 hover:bg-camel-pale/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{button.label}</span>
            </button>
          );
        })}
      </div>

      {qrTarget ? (
        <div
          className={`absolute bottom-6 right-6 z-30 hidden w-36 rounded-card border border-white/70 bg-white/82 p-3 text-center shadow-card backdrop-blur-md transition-all duration-500 lg:block ${
            controlsVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(qrTarget)}`}
            alt="QR code for guest submissions"
            className="mx-auto h-24 w-24 rounded-[8px] bg-white"
          />
          <p className="mt-2 text-xs font-bold text-navy">{t("live.qrTitle")}</p>
          <p className="mt-0.5 text-[10px] leading-4 text-navy/52">{t("live.qrText")}</p>
        </div>
      ) : null}

      {/* Decorative header */}
      <div
        className={`absolute left-10 top-8 z-10 hidden items-center gap-3 select-none transition-opacity duration-500 lg:flex ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="rounded-full bg-tweed/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-tweed">
          Live Memory Wall
        </div>
        <p className="text-sm font-semibold tracking-wider text-navy/55">Jajah &amp; Smart</p>
      </div>

      {viewMode !== "cloud" && (
        <div
          className={`absolute right-10 top-8 z-10 hidden text-xs font-semibold tracking-[0.16em] text-navy/40 select-none transition-opacity duration-500 lg:block ${
            controlsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Slide {activeItems.length ? activeIndex + 1 : 0} of {activeItems.length}
        </div>
      )}

      {/* Content Area */}
      <div className="flex w-full items-center justify-center px-8 py-24 md:px-16 lg:px-24">
        
        {/* Mode 1: Slideshow View */}
        {viewMode !== "cloud" && (
          <div className="flex-grow flex items-center justify-center w-full max-w-6xl mx-auto">
            {!activeItems.length ? (
              <div className="rounded-card border border-white/60 bg-white/70 p-10 text-center shadow-card backdrop-blur-md">
                <MessageSquare className="mx-auto h-12 w-12 text-tweed/35" />
                <p className="mt-4 text-lg font-semibold text-navy">Waiting for submissions</p>
                <p className="mt-2 text-sm text-navy/55">Scan the QR code to add a wish or photo.</p>
              </div>
            ) : null}
            {activeItems.map((item, index) => {
              const isActive = index === activeIndex;
              if (!isActive) return null;
              const messageText = item.message || "";
              const captionText = item.caption || "";
              const itemHasThai = containsThai(messageText) || containsThai(captionText);

              return (
                <div
                  key={item.id}
                  className="flex h-full max-h-[85vh] w-full max-w-5xl transform flex-col items-center justify-center transition-all duration-700 animate-scale-up"
                >
                  {item.type === "wish" ? (
                    /* Wish Card Layout - Elegant Minimalist Board */
                    <div className="relative flex min-h-[58vh] max-h-[78vh] w-full max-w-4xl flex-col justify-between overflow-hidden rounded-card border border-white/50 bg-white/70 p-8 pt-20 text-center shadow-2xl backdrop-blur-lg md:p-12 md:pt-24">
                      <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-navy p-4 text-ivory-warm shadow-lg">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div className="flex min-h-0 flex-grow flex-col justify-center">
                        <p className={`mx-auto max-w-4xl overflow-hidden break-words px-2 text-navy md:px-8 ${textFontClass(messageText)} ${projectorMessageClass(messageText)}`}>
                          {item.message}
                        </p>
                      </div>
                      <div className="mt-8 flex flex-col items-center justify-center">
                        <p className={`text-xl font-bold ${itemHasThai ? "text-navy" : "bg-gradient-to-r from-navy to-tweed bg-clip-text text-transparent"}`}>
                          — {item.guest_name}
                        </p>
                        {item.relationship || item.table_number ? (
                          <p className={`mt-2 text-xs font-semibold text-navy/40 ${itemHasThai ? "" : "uppercase tracking-[0.2em]"}`}>
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-navy/28">
                          <ImageIcon className="h-16 w-16" />
                          <p className="text-sm font-semibold">Shared wedding photo</p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.caption || "Shared moment"}
                          className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-lg animate-ken-burns z-10"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute top-6 left-6 rounded-full bg-navy p-3 text-ivory-warm shadow-lg z-20">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      </div>
                      {/* Photo details pane */}
                      <div className="flex flex-col justify-between p-10 md:p-16 lg:p-20 bg-ivory-warm/40">
                        <div className="animate-fade-in-up">
                          <span className={`rounded-full bg-tweed/10 px-3 py-1 text-[10px] font-bold text-tweed ${itemHasThai ? "" : "uppercase tracking-[0.2em]"}`}>
                            {item.category || "Couple Moment"}
                          </span>
                          <h2 className={`mt-8 text-3xl leading-relaxed text-navy md:text-4xl lg:text-5xl font-semibold ${textFontClass(captionText)}`}>
                            {item.caption ? `“${item.caption}”` : "Shared a beautiful moment!"}
                          </h2>
                        </div>
                        <div className="mt-10 border-t border-ash-pale/50 pt-8 animate-fade-in-up">
                          <p className={`text-xl font-bold ${itemHasThai ? "text-navy" : "bg-gradient-to-r from-navy to-tweed bg-clip-text text-transparent"}`}>
                            — {item.guest_name}
                          </p>
                          {item.table_number && (
                            <p className={`mt-2 text-xs font-semibold text-navy/40 ${itemHasThai ? "" : "uppercase tracking-[0.2em]"}`}>
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
