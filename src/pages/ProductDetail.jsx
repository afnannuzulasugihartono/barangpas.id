import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Share2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { formatRupiah, platformInfo } from '../lib/format';
import { useSource } from '../contexts/SourceContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { source } = useSource();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/product-detail?id=${id}`);
      if (!res.ok) throw new Error('Produk tidak ditemukan');
      setProduct(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleBuy = async () => {
    setRedirecting(true);
    try {
      const res = await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, referrer_source: source }),
      });
      const data = await res.json();
      if (res.ok && data.affiliate_url) {
        window.open(data.affiliate_url, '_blank', 'noopener,noreferrer');
      } else {
        window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
    } finally {
      setRedirecting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Tautan disalin!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFAFC]">
        <Header />
        <Loading label="Memuat produk..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FFFAFC]">
        <Header />
        <ErrorState message={error || 'Produk tidak ditemukan'} onRetry={load} />
      </div>
    );
  }

  const platform = platformInfo(product.affiliate_platform);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://barangpas.id/produk/${product.id}`;

  return (
    <div className="min-h-screen bg-[#FFFAFC] pb-28 md:pb-0">
      <title>{`${product.name} — barangpas`}</title>
      <meta name="description" content={product.description || `Beli ${product.name} sekarang di ${platform.label} lewat barangpas`} />
      <meta property="og:type" content="product" />
      <meta property="og:title" content={`${product.name} — barangpas`} />
      <meta property="og:description" content={product.description || `Beli ${product.name} sekarang di ${platform.label} lewat barangpas`} />
      <meta property="og:image" content={product.image_url} />
      <meta property="og:url" content={pageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[#8A6373] hover:text-[#FF6FA5] font-medium mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start">
          {/* Image */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(255,150,180,0.18)] border border-[#FFEDF3] md:sticky md:top-24">
            <div className="relative aspect-square bg-[#FFF3F7]">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              <button
                onClick={handleShare}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                aria-label="Bagikan"
              >
                <Share2 className="w-4 h-4 text-[#FF6FA5]" />
              </button>
              <span
                className="absolute bottom-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                style={{ backgroundColor: platform.bg, color: platform.color }}
              >
                Tersedia di {platform.label}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 md:mt-0">
            <div className="bg-white rounded-3xl border border-[#FFEDF3] p-5">
              <span className="text-[11px] font-semibold text-[#FF6FA5] bg-[#FFE4EC] px-2.5 py-1 rounded-full uppercase tracking-wide">
                {product.category}
              </span>
              <h1 className="font-heading text-2xl md:text-3xl text-[#2D2D2D] mt-3 leading-snug">{product.name}</h1>
              <p className="font-heading text-3xl text-[#FF6FA5] mt-2">{formatRupiah(product.price)}</p>
              <p className="text-sm text-[#6B5560] leading-relaxed mt-4 whitespace-pre-line">
                {product.description}
              </p>

              <button
                onClick={handleBuy}
                disabled={redirecting}
                className="hidden md:flex w-full mt-6 bg-[#FF6FA5] hover:bg-[#FF4F91] disabled:opacity-70 text-white font-heading text-lg py-3.5 rounded-full shadow-[0_6px_20px_rgba(255,111,165,0.4)] items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {redirecting ? 'Mengalihkan...' : 'Beli Sekarang'}
              </button>
            </div>

            <Link to={`/kategori/${product.category}`} className="block text-center text-xs text-[#FF6FA5] font-semibold mt-4 hover:underline">
              Lihat produk {product.category} lainnya →
            </Link>
          </div>
        </div>
      </main>

      {/* Mobile fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#FFE4EC] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBuy}
            disabled={redirecting}
            className="w-full bg-[#FF6FA5] hover:bg-[#FF4F91] disabled:opacity-70 text-white font-heading text-lg py-3.5 rounded-full shadow-[0_6px_20px_rgba(255,111,165,0.4)] flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {redirecting ? 'Mengalihkan...' : 'Beli Sekarang'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
