import { NextResponse } from "next/server";
import { moderatePhotoSubmission } from "@/lib/auto-moderation";
import { createPhoto, isGoogleStoreConfigured, moderateSubmission } from "@/lib/google-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { photoCategories, type PhotoCategory, type PhotoMoment } from "@/lib/types";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const limit = checkRateLimit(request, "photo-submit", { limit: 3, windowMs: 5 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const formData = await request.formData();
  const guestName = String(formData.get("guest_name") || "").trim();
  const file = formData.get("photo");
  const categoryValue = String(formData.get("category") || "Couple Moment");
  const category = photoCategories.includes(categoryValue as PhotoCategory)
    ? (categoryValue as PhotoCategory)
    : "Couple Moment";
  const now = new Date().toISOString();

  if (!guestName || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Invalid photo submission" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Photo is too large. Please choose a smaller photo and try again." },
      { status: 400 }
    );
  }

  if (!allowedImageTypes.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WEBP uploads are allowed" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileBase64 = bytes.toString("base64");
  const tableNumber = String(formData.get("table_number") || "").trim() || null;
  const caption = String(formData.get("caption") || "").trim() || null;
  const moderation = await moderatePhotoSubmission({
    guestName,
    tableNumber,
    caption,
    category,
    fileType: file.type,
    fileBase64
  });

  if (!isGoogleStoreConfigured) {
    return NextResponse.json({ ok: true, preview: true });
  }

  const photo: PhotoMoment = {
    id: crypto.randomUUID(),
    guest_name: guestName,
    table_number: tableNumber,
    caption,
    category,
    image_url: "",
    thumbnail_url: null,
    status: moderation.status,
    likes_count: 0,
    is_pinned: false,
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
    file_base64: fileBase64,
    status: moderation.status
  });
  const savedId = result?.id || photo.id;

  if (moderation.status !== "approved") {
    await moderateSubmission({
      content_type: "photo",
      id: savedId,
      status: moderation.status
    });
  }

  return NextResponse.json({
    ok: true,
    photo: {
      ...photo,
      id: savedId,
      image_url: result?.image_url || "",
      thumbnail_url: result?.image_url || null
    }
  });
}
