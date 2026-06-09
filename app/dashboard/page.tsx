"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  EyeOff,
  FileText,
  Heart,
  Images,
  MessageSquareText,
  Pin,
  PinOff,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Users
} from "lucide-react";
import { Button, PageShell, StatusBadge } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";
import type { PhotoMoment, SubmissionStatus, Wish } from "@/lib/types";

type DashboardTab = "latest" | "topWishes" | "topPhotos" | "moderation" | "blocked";
type ContentType = "wish" | "photo";
type ContentFilter = "all" | ContentType;

type DashboardItem = {
  id: string;
  type: ContentType;
  name: string;
  text: string;
  status: SubmissionStatus;
  likes: number;
  pinned: boolean;
  tableNumber: string | null;
  imageUrl?: string | null;
};

const tabLabels = {
  en: {
    latest: "Latest",
    topWishes: "Top wishes",
    topPhotos: "Top photos",
    moderation: "Moderation",
    blocked: "Blocked"
  },
  th: {
    latest: "รายการล่าสุด",
    topWishes: "คำอวยพรยอดนิยม",
    topPhotos: "รูปยอดนิยม",
    moderation: "ตรวจรายการ",
    blocked: "บล็อกไว้"
  }
};

const copy = {
  en: {
    eyebrow: "Admin Dashboard",
    title: "Wedding Control Room",
    intro: "Review submissions, pin highlights for live display, export wishes, and download guest photos.",
    unauthorized: "Please sign in as admin to use moderation, pinning, and downloads.",
    signIn: "Admin sign in",
    refresh: "Refresh",
    wishes: "Wishes",
    photos: "Photos",
    guests: "Guests",
    likes: "Likes",
    quick: "Quick actions",
    live: "Open Live",
    qr: "Open QR",
    csv: "Download wishes CSV",
    pdf: "Print wishes PDF",
    zip: "Download photos ZIP",
    restore: "Show",
    hide: "Hide",
    delete: "Delete",
    pin: "Pin",
    unpin: "Unpin",
    search: "Search name, message, table, or category",
    all: "All",
    noItems: "No items in this view.",
    by: "by",
    table: "Table",
    pinned: "Pinned",
    adminOnly: "Admin only",
    updated: "Updated"
  },
  th: {
    eyebrow: "แดชบอร์ดแอดมิน",
    title: "ศูนย์ควบคุมหน้างาน",
    intro: "ตรวจรายการที่แขกส่งเข้ามา ปักหมุดขึ้น Live ส่งออกคำอวยพร และดาวน์โหลดรูปทั้งหมด",
    unauthorized: "กรุณาเข้าสู่ระบบแอดมินเพื่อซ่อน/แสดง/ลบ ปักหมุด และดาวน์โหลดข้อมูล",
    signIn: "เข้าสู่ระบบแอดมิน",
    refresh: "รีเฟรช",
    wishes: "คำอวยพร",
    photos: "รูปภาพ",
    guests: "แขกที่ร่วมส่ง",
    likes: "ถูกใจ",
    quick: "ทางลัด",
    live: "เปิด Live",
    qr: "เปิดหน้า QR",
    csv: "ดาวน์โหลดคำอวยพร CSV",
    pdf: "พิมพ์/บันทึก PDF",
    zip: "ดาวน์โหลดรูป ZIP",
    restore: "แสดง",
    hide: "ซ่อน",
    delete: "ลบ",
    pin: "ปักหมุด",
    unpin: "ยกเลิกปักหมุด",
    search: "ค้นหาชื่อ ข้อความ โต๊ะ หรือหมวดรูป",
    all: "ทั้งหมด",
    noItems: "ไม่มีรายการในมุมมองนี้",
    by: "โดย",
    table: "โต๊ะ",
    pinned: "ปักหมุด",
    adminOnly: "สำหรับแอดมิน",
    updated: "อัปเดต"
  }
};

export default function DashboardPage() {
  const { language, tPhotoCategory } = useLanguage();
  const c = copy[language];
  const tabs = tabLabels[language];
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [photos, setPhotos] = useState<PhotoMoment[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("latest");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("all");

  async function loadDashboard() {
    setLoading(true);
    const response = await fetch("/api/admin/submissions", { cache: "no-store" });

    if (response.status === 401) {
      setIsAuthorized(false);
      const [wallResponse, galleryResponse] = await Promise.all([
        fetch("/api/wall", { cache: "no-store" }),
        fetch("/api/gallery", { cache: "no-store" })
      ]);
      const wallData = wallResponse.ok ? ((await wallResponse.json()) as { wishes: Wish[] }) : { wishes: [] };
      const galleryData = galleryResponse.ok
        ? ((await galleryResponse.json()) as { photos: PhotoMoment[] })
        : { photos: [] };
      setWishes(wallData.wishes || []);
      setPhotos(galleryData.photos || []);
      setLastUpdated(new Date());
      setLoading(false);
      return;
    }

    if (response.ok) {
      const data = (await response.json()) as { wishes: Wish[]; photos: PhotoMoment[] };
      setWishes(data.wishes || []);
      setPhotos(data.photos || []);
      setIsAuthorized(true);
      setLastUpdated(new Date());
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard().catch(() => setLoading(false));
  }, []);

  const visibleWishes = wishes.filter((wish) => wish.status !== "deleted");
  const visiblePhotos = photos.filter((photo) => photo.status !== "deleted");

  const totalLikes = useMemo(
    () =>
      visibleWishes.reduce((sum, wish) => sum + (wish.likes_count || 0), 0) +
      visiblePhotos.reduce((sum, photo) => sum + (photo.likes_count || 0), 0),
    [visiblePhotos, visibleWishes]
  );

  const guestCount = useMemo(() => {
    const names = new Set<string>();
    [...visibleWishes, ...visiblePhotos].forEach((item) => names.add(item.guest_name.trim().toLowerCase()));
    return names.size;
  }, [visiblePhotos, visibleWishes]);

  const latestItems = useMemo(
    () =>
      [
        ...visibleWishes.map((wish) => ({
          id: wish.id,
          type: "wish" as const,
          name: wish.guest_name,
          text: wish.message,
          status: wish.status,
          likes: wish.likes_count,
          pinned: wish.is_pinned,
          createdAt: wish.created_at,
          tableNumber: wish.table_number,
          imageUrl: null,
          item: wish
        })),
        ...visiblePhotos.map((photo) => ({
          id: photo.id,
          type: "photo" as const,
          name: photo.guest_name,
          text: photo.caption || tPhotoCategory(photo.category),
          status: photo.status,
          likes: photo.likes_count,
          pinned: photo.is_pinned,
          createdAt: photo.created_at,
          tableNumber: photo.table_number,
          imageUrl: photo.thumbnail_url || photo.image_url,
          item: photo
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tPhotoCategory, visiblePhotos, visibleWishes]
  );

  const topWishes = useMemo(
    () => [...visibleWishes].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)),
    [visibleWishes]
  );
  const topPhotos = useMemo(
    () => [...visiblePhotos].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)),
    [visiblePhotos]
  );
  const moderationItems = latestItems.filter((item) => item.status === "pending" || item.pinned);
  const blockedItems = latestItems.filter((item) => item.status === "hidden");
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filterItem = (item: DashboardItem) =>
    (contentFilter === "all" || item.type === contentFilter) && matchesDashboardSearch(item, normalizedSearch);
  const filteredLatestItems = latestItems.filter(filterItem);
  const filteredTopWishes =
    contentFilter === "photo"
      ? []
      : topWishes.filter((wish) =>
          matchesDashboardSearch(
            {
              id: wish.id,
              type: "wish",
              name: wish.guest_name,
              text: wish.message,
              status: wish.status,
              likes: wish.likes_count,
              pinned: wish.is_pinned,
              tableNumber: wish.table_number
            },
            normalizedSearch
          )
        );
  const filteredTopPhotos =
    contentFilter === "wish"
      ? []
      : topPhotos.filter((photo) =>
          matchesDashboardSearch(
            {
              id: photo.id,
              type: "photo",
              name: photo.guest_name,
              text: `${photo.caption || ""} ${tPhotoCategory(photo.category)} ${photo.category}`,
              status: photo.status,
              likes: photo.likes_count,
              pinned: photo.is_pinned,
              tableNumber: photo.table_number,
              imageUrl: photo.thumbnail_url || photo.image_url
            },
            normalizedSearch
          )
        );
  const filteredModerationItems = moderationItems.filter(filterItem);
  const filteredBlockedItems = blockedItems.filter(filterItem);
  const tabCounts: Record<DashboardTab, number> = {
    latest: filteredLatestItems.length,
    topWishes: filteredTopWishes.length,
    topPhotos: filteredTopPhotos.length,
    moderation: filteredModerationItems.length,
    blocked: filteredBlockedItems.length
  };

  const stats = [
    { label: c.wishes, value: visibleWishes.length, icon: MessageSquareText },
    { label: c.photos, value: visiblePhotos.length, icon: Images },
    { label: c.guests, value: guestCount, icon: Users },
    { label: c.likes, value: totalLikes, icon: Heart }
  ];

  async function updateStatus(contentType: ContentType, id: string, status: SubmissionStatus) {
    if (!isAuthorized) return;
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: contentType, id, status })
    });
    if (contentType === "wish") {
      setWishes((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    } else {
      setPhotos((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    }
  }

  async function updatePin(contentType: ContentType, id: string, isPinned: boolean) {
    if (!isAuthorized) return;
    await fetch("/api/admin/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: contentType, id, is_pinned: isPinned })
    });
    if (contentType === "wish") {
      setWishes((items) => items.map((item) => (item.id === id ? { ...item, is_pinned: isPinned } : item)));
    } else {
      setPhotos((items) => items.map((item) => (item.id === id ? { ...item, is_pinned: isPinned } : item)));
    }
  }

  function downloadWishesCsv() {
    const header = ["guest_name", "relationship", "table_number", "message_type", "message", "likes_count", "is_pinned", "created_at"];
    const rows = visibleWishes.map((wish) =>
      [wish.guest_name, wish.relationship || "", wish.table_number || "", wish.message_type, wish.message, wish.likes_count, wish.is_pinned, wish.created_at]
        .map(csvCell)
        .join(",")
    );
    downloadBlob([header.join(","), ...rows].join("\n"), "jajah-smart-wishes.csv", "text/csv;charset=utf-8");
  }

  function printWishesPdf() {
    const html = `
      <html><head><title>Jajah & Smart Wishes</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:32px;color:#0a1f44}
        h1{font-size:28px} article{border-bottom:1px solid #ddd;padding:16px 0}
        .meta{color:#777;font-size:12px} p{line-height:1.7}
      </style></head><body>
      <h1>Jajah & Smart Wedding Wishes</h1>
      ${visibleWishes
        .map(
          (wish) => `<article><strong>${escapeHtml(wish.guest_name)}</strong><p>${escapeHtml(wish.message)}</p><div class="meta">${escapeHtml(wish.message_type)} · ${wish.likes_count || 0} likes · ${escapeHtml(wish.created_at)}</div></article>`
        )
        .join("")}
      </body></html>`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <PageShell eyebrow={c.eyebrow} title={c.title} intro={c.intro}>
      {isAuthorized === false ? (
        <div className="mb-6 rounded-card border border-tweed/25 bg-camel-pale/35 p-4 text-sm text-navy">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-tweed" />
              {c.unauthorized}
            </span>
            <Link href="/admin" className="font-semibold text-tweed hover:text-navy">
              {c.signIn}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-navy/55">
          {lastUpdated ? `${c.updated}: ${formatTime(lastUpdated, language)}` : loading ? "Loading..." : ""}
        </p>
        <Button type="button" variant="secondary" onClick={loadDashboard} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {c.refresh}
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-card border border-white/60 bg-ivory-warm/82 p-5 shadow-card">
              <Icon className="mb-4 h-5 w-5 text-tweed" />
              <p className="text-3xl font-semibold text-navy">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-navy/55">{stat.label}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-card border border-white/60 bg-ivory-warm/72 p-4 shadow-card">
          <div className="mb-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/38" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={c.search}
                className="h-12 w-full rounded-[8px] border border-tweed/18 bg-white/72 pl-11 pr-4 text-sm text-navy outline-none transition placeholder:text-navy/35 focus:border-tweed focus:bg-white"
              />
            </label>
            <div className="grid grid-cols-3 rounded-[8px] border border-tweed/18 bg-white/58 p-1">
              {[
                ["all", c.all],
                ["wish", c.wishes],
                ["photo", c.photos]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setContentFilter(value as ContentFilter)}
                  className={`rounded-[6px] px-3 py-2 text-xs font-bold transition ${
                    contentFilter === value ? "bg-navy text-ivory-warm" : "text-navy/58 hover:bg-camel-pale/35"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {(Object.keys(tabs) as DashboardTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab
                    ? "border-navy bg-navy text-ivory-warm"
                    : "border-tweed/20 bg-white/50 text-navy/68 hover:bg-camel-pale/40"
                }`}
              >
                <span>{tabs[tab]}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    activeTab === tab ? "bg-white/18 text-ivory-warm" : "bg-navy/8 text-navy/58"
                  }`}
                >
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {activeTab === "latest" ? (
            <AdminList
              items={filteredLatestItems}
              emptyText={c.noItems}
              labels={c}
              isAuthorized={!!isAuthorized}
              onStatus={updateStatus}
              onPin={updatePin}
            />
          ) : null}
          {activeTab === "topWishes" ? (
            <WishAdminList wishes={filteredTopWishes} emptyText={c.noItems} labels={c} isAuthorized={!!isAuthorized} onStatus={updateStatus} onPin={updatePin} />
          ) : null}
          {activeTab === "topPhotos" ? (
            <PhotoAdminList photos={filteredTopPhotos} emptyText={c.noItems} labels={c} isAuthorized={!!isAuthorized} onStatus={updateStatus} onPin={updatePin} />
          ) : null}
          {activeTab === "moderation" ? (
            <AdminList
              items={filteredModerationItems}
              emptyText={c.noItems}
              labels={c}
              isAuthorized={!!isAuthorized}
              onStatus={updateStatus}
              onPin={updatePin}
            />
          ) : null}
          {activeTab === "blocked" ? (
            <AdminList
              items={filteredBlockedItems}
              emptyText={c.noItems}
              labels={c}
              isAuthorized={!!isAuthorized}
              onStatus={updateStatus}
              onPin={updatePin}
            />
          ) : null}
        </div>

        <div className="grid content-start gap-4">
          <Panel title={c.quick}>
            <div className="grid gap-3">
              <QuickLink href="/live" icon={Radio} label={c.live} />
              <QuickLink href="/qr" icon={QrCode} label={c.qr} />
              <button onClick={downloadWishesCsv} className="dashboard-action">
                <Download className="h-4 w-4 text-tweed" />
                {c.csv}
              </button>
              <button onClick={printWishesPdf} className="dashboard-action">
                <FileText className="h-4 w-4 text-tweed" />
                {c.pdf}
              </button>
              <a
                href="/api/admin/photos.zip"
                className={`dashboard-action ${!isAuthorized ? "pointer-events-none opacity-50" : ""}`}
              >
                <Download className="h-4 w-4 text-tweed" />
                {c.zip}
              </a>
            </div>
          </Panel>

          <Panel title={c.adminOnly}>
            <div className="grid gap-2 text-sm text-navy/62">
              <p>{c.hide} / {c.restore} / {c.delete}</p>
              <p>{c.pin} / {c.unpin}</p>
            </div>
          </Panel>
        </div>
      </section>
    </PageShell>
  );
}

function AdminList({
  items,
  emptyText,
  labels,
  isAuthorized,
  onStatus,
  onPin
}: {
  items: DashboardItem[];
  emptyText: string;
  labels: typeof copy.en;
  isAuthorized: boolean;
  onStatus: (contentType: ContentType, id: string, status: SubmissionStatus) => void;
  onPin: (contentType: ContentType, id: string, isPinned: boolean) => void;
}) {
  if (!items.length) return <Empty text={emptyText} />;
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <ModerationCard key={`${item.type}-${item.id}`} {...item} labels={labels} isAuthorized={isAuthorized} onStatus={onStatus} onPin={onPin} />
      ))}
    </div>
  );
}

function WishAdminList(props: {
  wishes: Wish[];
  emptyText: string;
  labels: typeof copy.en;
  isAuthorized: boolean;
  onStatus: (contentType: ContentType, id: string, status: SubmissionStatus) => void;
  onPin: (contentType: ContentType, id: string, isPinned: boolean) => void;
}) {
  return (
    <AdminList
      items={props.wishes.map((wish) => ({
        id: wish.id,
        type: "wish" as const,
        name: wish.guest_name,
        text: wish.message,
        status: wish.status,
        likes: wish.likes_count,
        pinned: wish.is_pinned,
        tableNumber: wish.table_number,
        imageUrl: null
      }))}
      emptyText={props.emptyText}
      labels={props.labels}
      isAuthorized={props.isAuthorized}
      onStatus={props.onStatus}
      onPin={props.onPin}
    />
  );
}

function PhotoAdminList(props: {
  photos: PhotoMoment[];
  emptyText: string;
  labels: typeof copy.en;
  isAuthorized: boolean;
  onStatus: (contentType: ContentType, id: string, status: SubmissionStatus) => void;
  onPin: (contentType: ContentType, id: string, isPinned: boolean) => void;
}) {
  return (
    <AdminList
      items={props.photos.map((photo) => ({
        id: photo.id,
        type: "photo" as const,
        name: photo.guest_name,
        text: photo.caption || photo.category,
        status: photo.status,
        likes: photo.likes_count,
        pinned: photo.is_pinned,
        tableNumber: photo.table_number,
        imageUrl: photo.thumbnail_url || photo.image_url
      }))}
      emptyText={props.emptyText}
      labels={props.labels}
      isAuthorized={props.isAuthorized}
      onStatus={props.onStatus}
      onPin={props.onPin}
    />
  );
}

function ModerationCard({
  id,
  type,
  name,
  text,
  status,
  likes,
  pinned,
  tableNumber,
  imageUrl,
  labels,
  isAuthorized,
  onStatus,
  onPin
}: {
  id: string;
  type: ContentType;
  name: string;
  text: string;
  status: SubmissionStatus;
  likes: number;
  pinned: boolean;
  tableNumber: string | null;
  imageUrl?: string | null;
  labels: typeof copy.en;
  isAuthorized: boolean;
  onStatus: (contentType: ContentType, id: string, status: SubmissionStatus) => void;
  onPin: (contentType: ContentType, id: string, isPinned: boolean) => void;
}) {
  const isPhoto = type === "photo";
  const TypeIcon = isPhoto ? Images : MessageSquareText;
  const typeLabel = isPhoto ? labels.photos : labels.wishes;
  const showRestore = status !== "approved";
  const statusCardClass = {
    approved: "border-emerald-200/80 bg-emerald-50/55 ring-1 ring-emerald-100",
    pending: "border-amber-200/90 bg-amber-50/70 ring-1 ring-amber-100",
    hidden: "border-rose-200/90 bg-rose-50/75 ring-1 ring-rose-100",
    deleted: "border-zinc-200 bg-zinc-50 ring-1 ring-zinc-100"
  }[status];

  return (
    <article
      className={`rounded-card border p-4 shadow-sm ${statusCardClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {imageUrl ? (
            <div
              aria-hidden="true"
              className="h-14 w-14 shrink-0 rounded-[8px] border border-white object-cover shadow-sm"
              style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }}
            />
          ) : (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${
                isPhoto ? "bg-camel-pale text-tweed" : "bg-navy/8 text-navy"
              }`}
            >
              <TypeIcon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                isPhoto ? "bg-camel-pale text-tweed" : "bg-navy/8 text-navy"
              }`}
            >
              <TypeIcon className="h-3 w-3" />
              {typeLabel}
            </span>
            <p className="mt-2 break-words font-semibold text-navy">{name}</p>
            <p className="mt-1 text-xs text-navy/45">{tableNumber ? `${labels.table} ${tableNumber}` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pinned ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-camel-pale px-2.5 py-1 text-[10px] font-bold text-navy">
              <Pin className="h-3 w-3" />
              {labels.pinned}
            </span>
          ) : null}
          <StatusBadge status={status} />
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-navy/72">{text}</p>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
        <Heart className="h-3 w-3 fill-current" />
        {likes || 0}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ActionButton disabled={!isAuthorized} onClick={() => onPin(type, id, !pinned)} label={pinned ? labels.unpin : labels.pin} icon={pinned ? PinOff : Pin} />
        {showRestore ? (
          <ActionButton disabled={!isAuthorized} onClick={() => onStatus(type, id, "approved")} label={labels.restore} icon={Eye} />
        ) : (
          <ActionButton disabled={!isAuthorized} onClick={() => onStatus(type, id, "hidden")} label={labels.hide} icon={EyeOff} />
        )}
        <ActionButton disabled={!isAuthorized} onClick={() => onStatus(type, id, "deleted")} label={labels.delete} icon={Trash2} danger />
      </div>
    </article>
  );
}

function ActionButton({
  disabled,
  onClick,
  label,
  icon: Icon,
  danger
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon: typeof Pin;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-tweed/20 bg-ivory-warm text-navy hover:bg-camel-pale/45"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-white/60 bg-ivory-warm/72 p-5 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-navy">{title}</h2>
      {children}
    </section>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: typeof Radio; label: string }) {
  return (
    <Link href={href} className="dashboard-action">
      <Icon className="h-4 w-4 text-tweed" />
      {label}
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[8px] border border-dashed border-tweed/20 p-5 text-sm text-navy/50">{text}</div>;
}

function matchesDashboardSearch(item: DashboardItem, query: string) {
  if (!query) return true;
  return [item.name, item.text, item.tableNumber, item.type, item.status]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadBlob(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTime(date: Date, language: "en" | "th") {
  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
