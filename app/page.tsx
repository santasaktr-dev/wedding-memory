import { Camera, Feather, MessageSquareText } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto min-h-[calc(100vh-145px)] max-w-6xl px-4 py-8 sm:px-6 sm:py-16 flex items-center justify-center">
      <div className="w-full max-w-4xl paper-frame rounded-card border border-white/50 bg-white/55 backdrop-blur-md px-5 py-10 text-center shadow-card sm:px-12 sm:py-16">
        {/* Monogram */}
        <p className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-tweed/35 font-serif text-xl font-medium text-tweed/95 bg-ivory shadow-inner">
          J&amp;S
        </p>

        {/* Welcome Headline */}
        <h1 className="mx-auto max-w-2xl font-serif text-4xl sm:text-6xl font-bold leading-tight bg-gradient-to-r from-navy via-tweed to-tweed-soft bg-clip-text text-transparent py-1">
          Letters to Jajah &amp; Smart
        </h1>
        
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-navy/75 sm:text-base sm:leading-7">
          A digital guestbook for wishes, memories, and moments from our wedding day.
        </p>

        {/* Large Mobile-First Action Cards */}
        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-3 max-w-3xl mx-auto">
          {/* Write Wish Card */}
          <Link 
            href="/write" 
            className="group flex flex-col items-center justify-center p-6 rounded-card border border-tweed/25 bg-ivory-warm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-ivory-warm group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Feather className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-navy group-hover:text-tweed transition-colors">
              Write a Wish
            </h3>
            <p className="mt-2 text-center text-xs text-navy/60 max-w-[200px]">
              Leave an elegant blessing, advice, or warm message for us.
            </p>
          </Link>

          {/* Upload Photo Card */}
          <Link 
            href="/upload" 
            className="group flex flex-col items-center justify-center p-6 rounded-card border border-camel-pale/80 bg-camel-pale/20 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tweed text-ivory-warm group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-navy group-hover:text-tweed transition-colors">
              Upload Moment
            </h3>
            <p className="mt-2 text-center text-xs text-navy/60 max-w-[200px]">
              Snap or upload your favorite photo captured today.
            </p>
          </Link>

          {/* Memory Wall Card */}
          <Link 
            href="/wall" 
            className="group flex flex-col items-center justify-center p-6 rounded-card border border-white/60 bg-white/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-navy border border-ash-pale/50 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <MessageSquareText className="h-5 w-5 text-tweed" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-navy group-hover:text-tweed transition-colors">
              Memory Wall
            </h3>
            <p className="mt-2 text-center text-xs text-navy/60 max-w-[200px]">
              Browse the wishes and photos shared by our guests.
            </p>
          </Link>
        </div>

        {/* Wedding details footer */}
        <div className="mt-10 border-t border-ash-pale/50 pt-6 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-tweed/95">
          <p>Sunday, 1 November 2026</p>
          <p className="mt-1 text-navy/50">Pearl Wedding Avenue</p>
        </div>
      </div>
    </section>
  );
}
