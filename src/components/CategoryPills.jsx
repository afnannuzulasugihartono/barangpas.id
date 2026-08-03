import { Link, useParams } from 'react-router-dom';

export default function CategoryPills({ categories }) {
  const { slug } = useParams();

  return (
    <div className="flex items-center justify-start gap-2 overflow-x-auto py-2 px-1 no-scrollbar w-full text-left">
      <Link
        to="/"
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
          !slug ? 'bg-[#FF6FA5] text-white' : 'bg-white text-[#8A6373] border border-[#FFE4EC] hover:border-[#FF9DBE]'
        }`}
      >
        Semua
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to={`/kategori/${c.slug}`}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            slug === c.slug ? 'bg-[#FF6FA5] text-white' : 'bg-white text-[#8A6373] border border-[#FFE4EC] hover:border-[#FF9DBE]'
          }`}
        >
          <span>{c.icon}</span>
          {c.name}
        </Link>
      ))}
    </div>
  );
}