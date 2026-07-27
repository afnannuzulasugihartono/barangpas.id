'use client';

import { useState } from 'react';
import PRODUCTS from '../data/products.json';

const PLATFORM_STYLE: Record<string, { label: string; className: string }> = {
  shopee: { label: 'Shopee', className: 'bg-orange-100 text-orange-700' },
  tiktok: { label: 'TikTok Shop', className: 'bg-slate-800 text-white' },
  lazada: { label: 'Lazada', className: 'bg-blue-100 text-blue-700' },
  tokopedia: { label: 'Tokopedia', className: 'bg-green-100 text-green-700' },
};

export default function BarangPas() {
  const [query, setQuery] = useState('');

  const filtered = PRODUCTS.filter(
    (p) =>
      p.id.toLowerCase().includes(query.toLowerCase()) ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto">
      <header className="text-center py-6">
        <h1 className="text-2xl font-bold text-slate-800">barangpas.id</h1>
        <p className="text-sm text-slate-500">Katalog Racun & Rekomendasi Produk Pas</p>
      </header>

      <div className="flex gap-2 justify-center mb-4">
        <a
          href="https://instagram.com/namaakunkamu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600"
        >
          Instagram
        </a>
        <a
          href="https://wa.me/62xxxxxxxxxx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600"
        >
          Chat WhatsApp
        </a>
      </div>

      <p className="text-center text-[11px] text-slate-400 mb-5">
        halaman ini berisi affiliate link — klik produk mengarahkan ke toko asli
      </p>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari nomor kode (misal: 001) atau barang..."
          className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">
            Produk dengan kode/nama itu belum ada.
          </p>
        )}

        {filtered.map((item) => {
          const platform = PLATFORM_STYLE[item.platform] ?? {
            label: item.platform,
            className: 'bg-slate-100 text-slate-600',
          };
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 mr-3 overflow-hidden flex items-center justify-center text-slate-400 text-xs">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  'foto'
                )}
              </div>
              <div className="flex-1 min-w-0 mr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                    #{item.id}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${platform.className}`}>
                    {platform.label}
                  </span>
                </div>
                <h2 className="text-sm font-medium text-slate-800 truncate mt-1">{item.title}</h2>
                <span className="text-xs text-slate-400">{item.category}</span>
              </div>
              <span className="bg-sky-600 text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap">
                Beli
              </span>
            </a>
          );
        })}
      </div>

      <footer className="text-center text-[11px] text-slate-300 mt-10 pb-6">
        Update produk lewat data/products.json
      </footer>
    </main>
  );
}
