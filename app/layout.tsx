import "./globals.css";

export const metadata = {
  title: "barangpas.id — Katalog Racun & Rekomendasi Produk Pas",
  description: "Etalase kurasi produk affiliate lintas platform. Cari nomor kode atau nama barang untuk langsung ke tokonya.",
  verification: {
    other: {
      "facebook-domain-verification": "v8v8yhm9nwwkz64m07fqzaa4f57y2h",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
