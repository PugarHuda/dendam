import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dendam — rival Piala Dunia yang nggak pernah lupa",
  description:
    "Rival sepak bola berbasis AI yang menyimpan dendam. Prediksi, hinaan, dan hot take-mu disimpan di Walrus Memory dan ditagih saat kamu meleset.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
