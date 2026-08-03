import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FFFAFC]">
      <title>barangpas — Link in Bio Belanja Favoritmu</title>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFE4EC] to-[#FFFAFC] pt-8 pb-8 px-4">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FFD1E3] blur-2xl opacity-70" />
        <div className="absolute top-20 -left-10 w-32 h-32 rounded-full bg-[#FFB6D0] blur-2xl opacity-50" />
        <div className="max-w-5xl mx-auto relative text-center">
          <span className="inline-flex items-center gap-1 bg-white/80 text-[#FF6FA5] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Dari Instagram, langsung ke sini!
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl leading-tight text-[#2D2D2D]">
            Semua barang <span className="text-[#FF6FA5]">pas</span> di satu tempat
          </h1>
          <p className="mt-3 text-[#8A6373] text-sm sm:text-base max-w-md mx-auto">
            Klik, temukan, dan beli langsung dari Shopee, TikTok Shop, Tokopedia, atau Lazada favoritmu.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4">
        {/* Category quick links */}
        <section className="relative z-10 py-4 mb-6 text-left">
          {loading ? null : <CategoryPills categories={categories} />}
        </section>

        {loading && <Loading label="Menyiapkan barang-barang pas..." />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          <>
            {featured.length > 0 && (
              <section id="featured" className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-heading text-xl sm:text-2xl text-[#2D2D2D] flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-[#FF6FA5]" /> Pilihan Spesial
                  </h2>
                </div>
                <ProductGrid products={featured} />
              </section>
            )}

            <section className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-xl sm:text-2xl text-[#2D2D2D]">Semua Produk</h2>
                <Link to="/kategori/kosmetik" className="text-xs font-semibold text-[#FF6FA5] flex items-center gap-1">
                  Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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