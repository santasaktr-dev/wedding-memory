import { PageShell } from "@/components/ui";

export default function FromUsPage() {
  return (
    <PageShell
      eyebrow="From Jajah & Smart"
      title="A Note of Thanks"
      intro="A small letter for the family and friends who made this day feel full."
    >
      <article className="paper-frame max-w-3xl rounded-card border border-tweed/25 bg-ivory-warm p-7 shadow-card sm:p-10">
        <div className="space-y-5 text-base leading-8 text-navy/75">
          <p>Dear family and friends,</p>
          <p>Thank you for being part of our special day.</p>
          <p>
            Your presence, love, laughter, and blessings mean so much to us. We created this space
            so every wish, memory, and beautiful moment can stay with us forever.
          </p>
          <p>With love,</p>
        </div>
        <p className="mt-8 font-serif text-4xl text-navy">Jajah &amp; Smart</p>
      </article>
    </PageShell>
  );
}
