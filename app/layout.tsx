import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant"
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-sans-thai"
});

export const metadata: Metadata = {
  title: "Letters to Jajah & Smart",
  description:
    "A digital guestbook for wishes, memories, and wedding moments from Jajah & Smart's special day.",
  openGraph: {
    title: "Letters to Jajah & Smart",
    description:
      "A digital guestbook for wishes, memories, and wedding moments from Jajah & Smart's special day.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${notoSansThai.variable}`}>
      <body className="min-h-screen pb-20 font-sans antialiased sm:pb-0">
        <LanguageProvider>
          <SiteHeader />
          <main className="animate-scale-up">{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
