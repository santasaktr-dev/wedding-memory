import { PhotoGalleryFeed } from "@/components/photo-gallery-feed";
import { PageShell } from "@/components/ui";

export default function GalleryPage() {
  return (
    <PageShell
      eyebrow="Photo Gallery"
      title="Shared Moments"
      intro="Guest-submitted photos from the wedding day, gathered into one quiet gallery."
      eyebrowKey="gallery.eyebrow"
      titleKey="gallery.title"
      introKey="gallery.intro"
    >
      <PhotoGalleryFeed />
    </PageShell>
  );
}
