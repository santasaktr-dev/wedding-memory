import { NextResponse } from "next/server";
import { moderateWishSubmission } from "@/lib/auto-moderation";
import { createWish, isGoogleStoreConfigured, moderateSubmission } from "@/lib/google-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { wishTypes, type Wish, type WishType } from "@/lib/types";

export async function POST(request: Request) {
  const limit = checkRateLimit(request, "wish-submit", { limit: 8, windowMs: 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const formData = await request.formData();
  const guestName = String(formData.get("guest_name") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const messageTypeValue = String(formData.get("message_type") || "Wedding Wish");
  const messageType = wishTypes.includes(messageTypeValue as WishType)
    ? (messageTypeValue as WishType)
    : "Wedding Wish";
  const now = new Date().toISOString();

  if (!guestName || message.length < 5 || message.length > 1000) {
    return NextResponse.json({ error: "Invalid wish submission" }, { status: 400 });
  }

  const relationship = String(formData.get("relationship") || "").trim() || null;
  const tableNumber = String(formData.get("table_number") || "").trim() || null;
  const moderation = await moderateWishSubmission({
    guestName,
    relationship,
    tableNumber,
    messageType,
    message
  });

  const wish: Wish = {
    id: crypto.randomUUID(),
    guest_name: guestName,
    relationship,
    table_number: tableNumber,
    message_type: messageType,
    message,
    status: moderation.status,
    likes_count: 0,
    is_pinned: false,
    created_at: now,
    updated_at: now
  };

  if (!isGoogleStoreConfigured) {
    return NextResponse.json({ ok: true, preview: true, wish });
  }

  const result = await createWish({
    guest_name: wish.guest_name,
    relationship: wish.relationship,
    table_number: wish.table_number,
    message_type: wish.message_type,
    message,
    status: moderation.status
  });
  const savedId = result?.id || wish.id;

  if (moderation.status !== "approved") {
    await moderateSubmission({
      content_type: "wish",
      id: savedId,
      status: moderation.status
    });
  }

  return NextResponse.json({
    ok: true,
    wish: {
      ...wish,
      id: savedId
    }
  });
}
