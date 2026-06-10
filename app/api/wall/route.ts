import { NextResponse } from "next/server";
import { isWishLocallySafeForPublic } from "@/lib/auto-moderation";
import { listApprovedWishes } from "@/lib/google-store";
import { sampleWishes } from "@/lib/mock-data";
import type { Wish } from "@/lib/types";

let cachedWishes: Wish[] | null = null;
let lastWishesFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds
const useDevFallback = process.env.NODE_ENV !== "production";

function wallCacheHeaders(forceFresh: boolean) {
  return {
    "Cache-Control": forceFresh ? "no-store, max-age=0" : "public, s-maxage=15, stale-while-revalidate=30"
  };
}

function publicSafeWishes(wishes: Wish[]) {
  return wishes.filter((wish) =>
    isWishLocallySafeForPublic({
      guestName: wish.guest_name,
      relationship: wish.relationship,
      tableNumber: wish.table_number,
      messageType: wish.message_type,
      message: wish.message
    })
  );
}

export async function GET(request: Request) {
  const now = Date.now();
  const forceFresh = new URL(request.url).searchParams.has("fresh");

  if (!forceFresh && cachedWishes && now - lastWishesFetchTime < CACHE_TTL) {
    return NextResponse.json(
      { wishes: cachedWishes },
      {
        headers: wallCacheHeaders(forceFresh)
      }
    );
  }

  try {
    const wishes = publicSafeWishes((await listApprovedWishes()) ?? (useDevFallback ? sampleWishes : []));
    cachedWishes = wishes;
    lastWishesFetchTime = now;

    return NextResponse.json(
      { wishes },
      {
        headers: wallCacheHeaders(forceFresh)
      }
    );
  } catch (error) {
    console.error("Error fetching wishes:", error);
    if (cachedWishes) {
      return NextResponse.json({ wishes: cachedWishes });
    }
    return NextResponse.json({ wishes: useDevFallback ? sampleWishes : [] });
  }
}
