import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naik Apa? — Transportasi Jakarta",
  description: "Rekomendasi transportasi Jakarta berbasis AI. Cepet, murah, ga ribet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
