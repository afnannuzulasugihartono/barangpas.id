import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Gagal memuat data');
      const data = await res.json();
      const filtered = data.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(q.toLowerCase())
      );
      setProducts(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [q]);

  return (
    <div className="min-h-screen bg-[#FFFAFC]">
      <title>{`Cari "${q}" — barangpas`}</title>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-heading text-xl sm:text-2xl text-[#2D2D2D] mb-4">
          Hasil untuk “{q}”
        </h1>
        {loading && <Loading />}
        {error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && (
          <ProductGrid products={products} emptyMessage="Tidak ada produk yang cocok. Coba kata kunci lain ya!" />
        )}
      </main>
      <Footer />
    </div>
  );
}
