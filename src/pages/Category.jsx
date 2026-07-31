import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryPills from '../components/CategoryPills';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';

export default function Category() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/products?category=${encodeURIComponent(slug)}`),
      ]);
      if (!catRes.ok || !prodRes.ok) throw new Error('Gagal memuat data');
      setCategories(await catRes.json());
      setProducts(await prodRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [slug]);

  const current = categories.find((c) => c.slug === slug);

  return (
    <div className="min-h-screen bg-[#FFFAFC]">
      <title>{current ? `${current.name} — barangpas` : 'Kategori — barangpas'}</title>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-heading text-2xl sm:text-3xl text-[#2D2D2D] mb-4 flex items-center gap-2">
          {current ? (<><span>{current.icon}</span> {current.name}</>) : 'Kategori'}
        </h1>
        <div className="mb-6">
          {!loading && <CategoryPills categories={categories} />}
        </div>
        {loading && <Loading />}
        {error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && <ProductGrid products={products} />}
      </main>
      <Footer />
    </div>
  );
}
