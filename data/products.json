'use client';
import { useState, useEffect } from 'react';

const AIRTABLE_TOKEN = 'patMbABT6yZrnU5rA.be5b2227c5249cc05b54b3dcae972f6dd5620893fffc96ca8ae3cb19233f6830';
const AIRTABLE_BASE_ID = 'appR6EmanzeYnDtLb';
const AIRTABLE_TABLE_NAME = 'Table 1';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
          {
            headers: {
              Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            },
            next: { revalidate: 10 }
          }
        );
        const data = await res.json();

        if (data.records) {
          const formattedData = data.records.map((record) => {
            const fields = record.fields;
            
            let imageUrl = 'https://via.placeholder.com/150';
            if (Array.isArray(fields.image) && fields.image.length > 0) {
              imageUrl = fields.image[0].url;
            } else if (typeof fields.image === 'string') {
              imageUrl = fields.image;
            }

            return {
              id: fields.id || '000',
              title: fields.title || 'Produk Tanpa Nama',
              category: fields.category || 'General',
              image: imageUrl,
              url: fields.url || '#'
            };
          });

          setProducts(formattedData);
        }
      } catch (error) {
        console.error('Gagal mengambil data dari Airtable:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.id.toLowerCase().includes(query.toLowerCase()) ||
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto font-sans pb-12">
      {/* Header Brand */}
      <header className="text-center py-6 border-b border-slate-200 mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">barangpas.id</h1>
        <p className="text-xs text-slate-500 mt-1">Katalog Racun & Rekomendasi Produk Pas</p>
      </header>

      {/* Kolom Pencarian Kode */}
      <div className="mb-6 sticky top-4 z-10">
        <input
          type="text"
          placeholder="Ketik kode (misal: 004) atau nama barang..."
          className="w-full p-3 pl-4 border border-slate-300 rounded-xl shadow-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Daftar Kartu Produk */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 text-xs">Memuat katalog barangpas.id...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <div key={item.id} className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-sky-300 transition-all">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 mr-3 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 mr-2">
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">#{item.id}</span>
                  <h2 className="text-xs font-semibold text-slate-800 truncate mt-1">{item.title}</h2>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.category}</span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all flex-shrink-0"
                >
                  Beli
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Barang dengan kode "<span className="font-semibold text-slate-600">{query}</span>" tidak ditemukan.
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center mt-12 text-[10px] text-slate-400">
        © 2026 barangpas.id • All Affiliate Links Reserved
      </footer>
    </main>
  );
}
