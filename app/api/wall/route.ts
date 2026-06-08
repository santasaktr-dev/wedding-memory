import { NextResponse } from "next/server";
import { listVisibleWishes } from "@/lib/google-store";
import { sampleWishes } from "@/lib/mock-data";
import type { Wish } from "@/lib/types";

let cachedWishes: Wish[] | null = null;
let lastWishesFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds

export async function GET() {
  const now = Date.now();
  if (cachedWishes && now - lastWishesFetchTime < CACHE_TTL) {
    return NextResponse.json(
      { wishes: cachedWishes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30"
        }
      }
    );
  }

  try {
    const wishes = (await listVisibleWishes()) ?? sampleWishes;
    cachedWishes = wishes;
    lastWishesFetchTime = now;

    return NextResponse.json(
      { wishes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching wishes:", error);
    if (cachedWishes) {
      return NextResponse.json({ wishes: cachedWishes });
    }
    return NextResponse.json({ wishes: sampleWishes });
  }
}
