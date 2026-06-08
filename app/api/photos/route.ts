import { NextResponse } from "next/server";
import { createPhoto, isGoogleStoreConfigured } from "@/lib/google-store";
import type { PhotoCategory, PhotoMoment } from "@/lib/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const guestName = String(formData.get("guest_name") || "").trim();
  const file = formData.get("photo");
  const now = new Date().toISOString();

  if (!guestName || !(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Invalid photo submission" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  if (!isGoogleStoreConfigured) {
    return NextResponse.json({ ok: true, preview: true });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const photo: PhotoMoment = {
    id: crypto.randomUUID(),
    guest_name: guestName,
    table_number: String(formData.get("table_number") || "").trim() || null,
    caption: String(formData.get("caption") || "").trim() || null,
    category: String(formData.get("category") || "Couple Moment") as PhotoCategory,
    image_url: "",
    thumbnail_url: null,
    status: "pending",
    likes_count: 0,
    created_at: now,
    updated_at: now
  };

  const result = await createPhoto({
    guest_name: photo.guest_name,
    table_number: photo.table_number,
    caption: photo.caption,
    category: photo.category,
    file_name: file.name,
    file_type: file.type,
    file_base64: bytes.toString("base64")
  });

  return NextResponse.json({
    ok: true,
    photo: {
      ...photo,
      id: result?.id || photo.id,
      image_url: result?.image_url || "",
      thumbnail_url: result?.image_url || null
    }
  });
}
