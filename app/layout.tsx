import type { Metadata, Viewport } from "next";
import "./globals.css";

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
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔥</text></svg>`,
          ),
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c11",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
