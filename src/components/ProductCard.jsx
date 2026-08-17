import { Link } from 'react-router-dom';
import { formatRupiah, platformInfo } from '../lib/format';
import { ArrowUpRight } from 'lucide-react';

export default function ProductCard({ product }) {
  const platform = platformInfo(product.affiliate_platform);
  const categoryLabel = product.category ? product.category.replace(/-/g, ' ') : '';

  return (
    <Link
      to={`/produk/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-zinc-200 shadow-sm hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 flex flex-col focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        {product.is_featured && (
          <span className="absolute top-3 left-3 bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-sm">
            ✨ Pilihan
          </span>
        )}
        <span
          className="absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-sm backdrop-blur"
          style={{ backgroundColor: platform.bg, color: platform.color }}
        >
          {platform.label}
        </span>
        <div className="absolute right-3 top-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {categoryLabel && (
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.12em]">{categoryLabel}</span>
        )}
        <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">{product.name}</h3>
        <p className="text-zinc-950 font-heading text-lg mt-auto pt-2">{formatRupiah(product.price)}</p>
      </div>
    </Link>
  );
}
