import { Link, useParams } from 'react-router-dom';
import CategoryIcon from '../lib/icons';

export default function CategoryPills({ categories }) {
  const { slug } = useParams();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory scroll-px-4">
      <Link
        to="/"
        className={`shrink-0 snap-start px-4 py-2.5 sm:py-2 rounded-full text-sm font-semibold transition-colors ${
          !slug
            ? 'bg-[#FF6FA5] text-white shadow-sm'
            : 'bg-white text-[#8A6373] border border-[#FFE4EC] hover:border-[#FFB6D0]'
        }`}
      >
        Semua
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to={`/kategori/${c.slug}`}
          className={`shrink-0 snap-start px-4 py-2.5 sm:py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            slug === c.slug
              ? 'bg-[#FF6FA5] text-white shadow-sm'
              : 'bg-white text-[#8A6373] border border-[#FFE4EC] hover:border-[#FFB6D0]'
          }`}
        >
          <CategoryIcon name={c.icon} className="w-4 h-4" />
          {c.name}
        </Link>
      ))}
    </div>
  );
}
