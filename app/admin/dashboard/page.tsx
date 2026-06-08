"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, EyeOff, LogOut, Trash2 } from "lucide-react";
import { Button, PageShell, StatusBadge } from "@/components/ui";
import type { PhotoMoment, SubmissionStatus, Wish } from "@/lib/types";

export default function AdminDashboardPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [photos, setPhotos] = useState<PhotoMoment[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSubmissions() {
    setLoading(true);
    const response = await fetch("/api/admin/submissions");

    if (!response.ok) {
      setLoading(false);
      return;
    }

    const data = (await response.json()) as { wishes: Wish[]; photos: PhotoMoment[] };
    setWishes(data.wishes || []);
    setPhotos(data.photos || []);
    setLoading(false);
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  const stats = useMemo(
    () => [
      { label: "Total wishes", value: wishes.length },
      { label: "Total photos", value: photos.length },
      {
        label: "New submissions",
        value: wishes.filter((wish) => wish.status === "pending").length + photos.filter((photo) => photo.status === "pending").length
      },
      { label: "Hidden wishes", value: wishes.filter((wish) => wish.status === "hidden").length },
      { label: "Hidden photos", value: photos.filter((photo) => photo.status === "hidden").length }
    ],
    [photos, wishes]
  );

  async function updateWish(id: string, status: SubmissionStatus) {
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: "wish", id, status })
    });
    setWishes((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  async function updatePhoto(id: string, status: SubmissionStatus) {
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: "photo", id, status })
    });
    setPhotos((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
  }

  return (
    <PageShell
      eyebrow="Admin Dashboard"
      title="Moderation"
      intro="Review, hide, or delete guest submissions after they arrive."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-card border border-tweed/20 bg-ivory-warm p-4 shadow-card">
              <p className="text-2xl font-semibold text-navy">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-navy/55">{stat.label}</p>
            </div>
          ))}
        </div>
        <Button variant="secondary" onClick={signOut} className="gap-2 sm:self-start">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      {loading ? <p className="text-navy/65">Loading submissions...</p> : null}

      <section className="grid gap-8">
        <AdminPanel title="Wishes">
          <div className="grid gap-3">
            {wishes.map((wish) => (
              <div key={wish.id} className="rounded-card border border-tweed/20 bg-ivory-warm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">{wish.guest_name}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-tweed">{wish.message_type}</p>
                  </div>
                  <StatusBadge status={wish.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-navy/75">{wish.message}</p>
                <ModerationActions onApprove={() => updateWish(wish.id, "approved")} onHide={() => updateWish(wish.id, "hidden")} onDelete={() => updateWish(wish.id, "deleted")} />
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Photos">
          <div className="grid gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-card border border-tweed/20 bg-ivory-warm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">{photo.guest_name}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-tweed">{photo.category}</p>
                  </div>
                  <StatusBadge status={photo.status} />
                </div>
                {photo.caption ? <p className="mt-3 text-sm leading-6 text-navy/75">{photo.caption}</p> : null}
                <Link href={photo.image_url} className="mt-2 inline-block text-sm text-tweed hover:text-navy">
                  View image
                </Link>
                <ModerationActions onApprove={() => updatePhoto(photo.id, "approved")} onHide={() => updatePhoto(photo.id, "hidden")} onDelete={() => updatePhoto(photo.id, "deleted")} />
              </div>
            ))}
          </div>
        </AdminPanel>
      </section>
    </PageShell>
  );
}

function AdminPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-tweed/20 bg-ivory/65 p-4">
      <h2 className="mb-4 font-serif text-3xl font-semibold text-navy">{title}</h2>
      {children}
    </section>
  );
}

function ModerationActions({
  onApprove,
  onHide,
  onDelete
}: {
  onApprove: () => void;
  onHide: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button type="button" onClick={onApprove} className="min-h-10 gap-2 px-3 py-2">
        <Check className="h-4 w-4" /> Approve
      </Button>
      <Button type="button" variant="secondary" onClick={onHide} className="min-h-10 gap-2 px-3 py-2">
        <EyeOff className="h-4 w-4" /> Hide
      </Button>
      <Button type="button" variant="ghost" onClick={onDelete} className="min-h-10 gap-2 px-3 py-2">
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
    </div>
  );
}
