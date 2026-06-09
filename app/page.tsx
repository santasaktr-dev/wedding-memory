import { HomePageContent } from "@/components/home-page-content";
import { listApprovedPhotos, listApprovedWishes } from "@/lib/google-store";
import { samplePhotos, sampleWishes } from "@/lib/mock-data";

const useDevFallback = process.env.NODE_ENV !== "production";

export default async function HomePage() {
  const [dbPhotos, dbWishes] = await Promise.all([
    listApprovedPhotos().catch(() => null),
    listApprovedWishes().catch(() => null)
  ]);
  const heroPhotos = dbPhotos?.length ? dbPhotos.slice(0, 2) : useDevFallback ? samplePhotos.slice(0, 2) : [];
  const featuredWish = dbWishes?.[0] ?? (useDevFallback ? sampleWishes[0] : null);
  const heroImage = heroPhotos[1] ?? heroPhotos[0];
  const galleryImage = heroPhotos[0] ?? heroPhotos[1];

  return (
    <HomePageContent
      featuredWish={featuredWish}
      galleryImage={galleryImage}
      heroImage={heroImage}
    />
  );
}
