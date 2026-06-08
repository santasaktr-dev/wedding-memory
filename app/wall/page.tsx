import { MemoryWallFeed } from "@/components/memory-wall-feed";
import { PageShell } from "@/components/ui";

export default function WallPage() {
  return (
    <PageShell
      eyebrow="Memory Wall"
      title="Wishes & Memories"
      intro="A living wall of words from the people who celebrated with us."
    >
      <MemoryWallFeed />
    </PageShell>
  );
}
