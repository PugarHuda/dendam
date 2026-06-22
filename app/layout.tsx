import type { Metadata, Viewport } from "next";
import { Fredoka, Caveat, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-nunito", display: "swap" });

const TITLE = "Dendam — the World Cup rival that never forgets";
const DESC =
  "A grudge-holding AI football rival. Your World Cup 2026 predictions, insults, and hot takes are stored on Walrus Memory and thrown back when you're wrong.";

export const metadata: Metadata = {
  metadataBase: new URL("https://dendam.vercel.app"),
  title: TITLE,
  description: DESC,
  applicationName: "Dendam",
  keywords: ["Walrus", "Walrus Memory", "Sui", "World Cup 2026", "AI agent", "Dendam"],
  authors: [{ name: "PugarHuda" }],
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "https://dendam.vercel.app",
    siteName: "Dendam",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#241046"/><circle cx="50" cy="51" r="38" fill="#7C3AED" stroke="#FBF6EE" stroke-width="4"/><path d="M22 47 Q33 40 43 49M78 47 Q67 40 57 49" stroke="#FFC83D" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="37" cy="60" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="63" cy="60" rx="6.5" ry="7.5" fill="#fff"/><circle cx="39" cy="62" r="3" fill="#241046"/><circle cx="65" cy="62" r="3" fill="#241046"/><path d="M38 80 Q49 77 61 71" stroke="#241046" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
          ),
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF6EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${caveat.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
