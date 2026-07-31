import { Link, useParams } from 'react-router-dom';

export default function CategoryPills({ categories }) {
  const { slug } = useParams();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <Link
        to="/"
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
          !slug ? 'bg-[#FF6FA5] text-white' : 'bg-white text-[#8A6373] border border-[#FFE4EC]'
        }`}
      >
        Semua
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to={`/kategori/${c.slug}`}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            slug === c.slug ? 'bg-[#FF6FA5] text-white' : 'bg-white text-[#8A6373] border border-[#FFE4EC]'
          }`}
        >
          <span>{c.icon}</span>
          {c.name}
        </Link>
      ))}
    </div>
  );
}
