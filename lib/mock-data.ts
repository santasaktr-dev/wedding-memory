import type { PhotoMoment, Wish } from "@/lib/types";

export const sampleWishes: Wish[] = [
  {
    id: "sample-1",
    guest_name: "Auntie May",
    relationship: "Family",
    table_number: "3",
    message_type: "Wedding Wish",
    message:
      "Wishing you both a lifetime of quiet mornings, generous laughter, and a love that keeps becoming home.",
    status: "approved",
    likes_count: 12,
    is_pinned: true,
    created_at: "2026-11-01T10:00:00.000Z",
    updated_at: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "sample-2",
    guest_name: "Nina",
    relationship: "Friend",
    table_number: "8",
    message_type: "Memory",
    message:
      "I will always remember the way you both looked at each other today. It made the whole room softer.",
    status: "approved",
    likes_count: 8,
    is_pinned: false,
    created_at: "2026-11-01T11:20:00.000Z",
    updated_at: "2026-11-01T11:20:00.000Z"
  }
];

export const samplePhotos: PhotoMoment[] = [
  {
    id: "photo-1",
    guest_name: "Wedding Guest",
    table_number: "5",
    caption: "A quiet corner before the reception.",
    category: "Reception",
    image_url:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    thumbnail_url: null,
    status: "approved",
    likes_count: 6,
    created_at: "2026-11-01T12:00:00.000Z",
    updated_at: "2026-11-01T12:00:00.000Z"
  },
  {
    id: "photo-2",
    guest_name: "Friend of the Bride",
    table_number: "2",
    caption: "Pearl Wedding Avenue in the afternoon light.",
    category: "Ceremony",
    image_url:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    thumbnail_url: null,
    status: "approved",
    likes_count: 10,
    created_at: "2026-11-01T12:30:00.000Z",
    updated_at: "2026-11-01T12:30:00.000Z"
  }
];
