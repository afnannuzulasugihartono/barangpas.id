import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

export default function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/cari?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#FFE4EC]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <form onSubmit={onSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF9DBE]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk favoritmu..."
            className="w-full bg-[#FFF3F7] rounded-full pl-9 pr-4 py-2.5 sm:py-2 text-sm outline-none border border-transparent focus:border-[#FF9DBE] focus:ring-4 focus:ring-[#FFE4EC] transition-all placeholder:text-[#D89AB0]"
          />
        </form>
        <Link
          to="/#featured"
          className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#FF6FA5] bg-[#FFE4EC] hover:bg-[#FFD8E6] px-3 py-2 rounded-full whitespace-nowrap transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> Pilihan
        </Link>
      </div>
    </header>
  );
}
