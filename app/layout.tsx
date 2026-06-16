import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dendam — the World Cup rival that never forgets",
  description:
    "A grudge-holding AI football rival. Your predictions, insults, and hot takes are stored on Walrus Memory and thrown back when you're wrong.",
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
