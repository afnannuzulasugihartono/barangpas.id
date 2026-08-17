import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Sparkles, ShieldCheck, Heart, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryPills from '../components/CategoryPills';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, featRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products?featured=true'),
        fetch('/api/products'),
      ]);
      if (!catRes.ok || !featRes.ok || !prodRes.ok) throw new Error('Gagal memuat data');
      setCategories(await catRes.json());
      setFeatured(await featRes.json());
      setProducts(await prodRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900">
      <title>BarangPas — Temukan barang yang benar-benar pas</title>
      <Header />

      <section className="relative overflow-hidden bg-white border-b border-zinc-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.10),transparent_28%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white px-3.5 py-2 text-xs font-semibold tracking-wide mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Kurasi barang, bukan sekadar jualan
            </span>
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight text-zinc-950">
              Temukan barang yang <span className="text-pink-500">benar-benar pas.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-zinc-500 max-w-xl leading-relaxed">
              Rekomendasi produk pilihan dengan informasi yang jujur—termasuk hal yang perlu kamu pertimbangkan sebelum membeli.
            </p>
            <form action="/cari" className="mt-8 max-w-2xl relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input name="q" placeholder="Cari produk, kategori, atau kebutuhan..." className="w-full rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] pl-14 pr-32 py-4 text-sm sm:text-base outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-300" />
              <button className="absolute right-2 top-2 bottom-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white px-5 font-semibold text-sm transition-colors">Cari</button>
            </form>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <section className="py-5 border-b border-zinc-100">
          {!loading && <CategoryPills categories={categories} />}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-8">
          {[
            [ShieldCheck, 'Kurasi jujur', 'Bukan cuma menonjolkan kelebihan.'],
            [TrendingUp, 'Temukan yang menarik', 'Dari produk populer sampai hidden gem.'],
            [Heart, 'Dibuat untuk pembeli', 'Fokus pada kebutuhan, bukan hard selling.'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl bg-white border border-zinc-100 p-5 flex gap-4 shadow-sm">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
              <div><h3 className="font-semibold text-sm">{title}</h3><p className="text-xs text-zinc-500 mt-1 leading-relaxed">{text}</p></div>
            </div>
          ))}
        </section>

        {loading && <Loading label="Menyiapkan barang-barang pas..." />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          <>
            {featured.length > 0 && (
              <section id="featured" className="mb-14 scroll-mt-24">
                <div className="flex items-end justify-between mb-5">
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-500 mb-1">Pilihan BarangPas</p><h2 className="font-heading text-2xl sm:text-3xl">Kami sudah pilihkan.</h2></div>
                  <Link to="/cari" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-zinc-600 hover:text-black">Explore <ArrowRight className="w-4 h-4" /></Link>
                </div>
                <ProductGrid products={featured} />
              </section>
            )}

            <section className="mb-14 rounded-3xl bg-zinc-950 text-white p-7 sm:p-10 overflow-hidden relative">
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pink-500/20 blur-3xl" />
              <div className="relative max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Kenapa BarangPas?</p>
                <h2 className="font-heading text-2xl sm:text-4xl mt-2">Kami juga kasih tahu kekurangannya.</h2>
                <p className="text-zinc-400 mt-4 leading-relaxed max-w-xl">Karena produk yang bagus bukan berarti sempurna. Kami ingin kamu tahu apa yang kamu dapat sebelum klik beli.</p>
              </div>
            </section>

            <section className="mb-14">
              <div className="flex items-end justify-between mb-5">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Discover</p><h2 className="font-heading text-2xl sm:text-3xl">Semua Produk</h2></div>
                <Link to="/cari" className="flex items-center gap-1 text-sm font-semibold text-zinc-600 hover:text-black">Lihat semua <ArrowRight className="w-4 h-4" /></Link>
              </div>
              <ProductGrid products={products} />
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
