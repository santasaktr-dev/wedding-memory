import { NextResponse } from "next/server";
import { createWish, isGoogleStoreConfigured } from "@/lib/google-store";
import type { Wish, WishType } from "@/lib/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const guestName = String(formData.get("guest_name") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const now = new Date().toISOString();

  if (!guestName || message.length < 5 || message.length > 1000) {
    return NextResponse.json({ error: "Invalid wish submission" }, { status: 400 });
  }

  const wish: Wish = {
    id: crypto.randomUUID(),
    guest_name: guestName,
    relationship: String(formData.get("relationship") || "").trim() || null,
    table_number: String(formData.get("table_number") || "").trim() || null,
    message_type: String(formData.get("message_type") || "Wedding Wish") as WishType,
    message,
    status: "pending",
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
    message
  });

  return NextResponse.json({
    ok: true,
    wish: {
      ...wish,
      id: result?.id || wish.id
    }
  });
}
