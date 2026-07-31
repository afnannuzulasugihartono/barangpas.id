import { Link } from 'react-router-dom';
import { formatRupiah, platformInfo } from '../lib/format';

export default function ProductCard({ product }) {
  const platform = platformInfo(product.affiliate_platform);

  return (
    <Link
      to={`/produk/${product.id}`}
      className="group bg-white rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(255,150,180,0.15)] hover:shadow-[0_8px_24px_rgba(255,150,180,0.28)] transition-all duration-300 hover:-translate-y-1 border border-[#FFEDF3] flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-[#FFF3F7]">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.is_featured && (
          <span className="absolute top-2 left-2 bg-[#FF6FA5] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            ✨ Pilihan
          </span>
        )}
        <span
          className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm"
          style={{ backgroundColor: platform.bg, color: platform.color }}
        >
          {platform.label}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-[#2D2D2D] line-clamp-2 leading-snug">{product.name}</h3>
        <p className="text-[#FF6FA5] font-heading text-lg mt-auto">{formatRupiah(product.price)}</p>
      </div>
    </Link>
  );
}
