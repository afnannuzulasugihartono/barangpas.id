import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "barangpas.id — Katalog Racun & Rekomendasi Produk Pas",
  description: "Etalase kurasi produk affiliate lintas platform. Cari nomor kode atau nama barang, langsung ke Shopee / TikTok Shop / Tokopedia.",
  verification: {
    other: {
      "facebook-domain-verification": "v8v8yhm9nwwkz64m07fqzaa4f57y2h",
    },
  },
  openGraph: {
    title: "barangpas.id",
    description: "Katalog Racun & Rekomendasi Produk Pas",
    url: "https://barangpas.id",
    siteName: "barangpas.id",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
