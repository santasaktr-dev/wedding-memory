import { NextResponse } from "next/server";
import { isPhotoLocallySafeForPublic } from "@/lib/auto-moderation";
import { listApprovedPhotos } from "@/lib/google-store";
import { samplePhotos } from "@/lib/mock-data";
import type { PhotoMoment } from "@/lib/types";

const devDemoHorizontalPhoto: PhotoMoment = {
  id: "demo-horizontal",
  guest_name: "Smart (Demo Landscape)",
  table_number: "9",
  caption: "This is a horizontal (landscape) photo demo. Under aspect-[4/5] and object-cover, it is centered and cropped automatically to maintain a cohesive grid.",
  category: "Couple Moment",
  image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
  thumbnail_url: null,
  status: "approved",
  likes_count: 0,
  is_pinned: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

let cachedPhotos: PhotoMoment[] | null = null;
let lastPhotosFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds
const useDevFallback = process.env.NODE_ENV !== "production";

function publicSafePhotos(photos: PhotoMoment[]) {
  return photos.filter((photo) =>
    isPhotoLocallySafeForPublic({
      guestName: photo.guest_name,
      tableNumber: photo.table_number,
      caption: photo.caption,
      category: photo.category
    })
  );
}

export async function GET() {
  const now = Date.now();
  if (cachedPhotos && now - lastPhotosFetchTime < CACHE_TTL) {
    return NextResponse.json(
      { photos: cachedPhotos },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30"
        }
      }
    );
  }

  try {
    const dbPhotos = await listApprovedPhotos();
    const photos = publicSafePhotos(dbPhotos ?? (useDevFallback ? [devDemoHorizontalPhoto, ...samplePhotos] : []));
    cachedPhotos = photos;
    lastPhotosFetchTime = now;

    return NextResponse.json(
      { photos },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching gallery photos:", error);
    if (cachedPhotos) {
      return NextResponse.json({ photos: cachedPhotos });
    }
    return NextResponse.json({
      photos: useDevFallback ? [devDemoHorizontalPhoto, ...samplePhotos] : []
    });
  }
}
