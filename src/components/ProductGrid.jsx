import ProductCard from './ProductCard';

export default function ProductGrid({ products, emptyMessage = 'Belum ada produk di kategori ini.' }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 text-[#B98599]">
        <p className="text-4xl mb-2">🎀</p>
        <p className="font-medium">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
