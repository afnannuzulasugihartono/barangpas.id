import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Menu } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        <Link to="/" className="shrink-0 hover:opacity-80 transition-opacity" aria-label="BarangPas home">
          <Logo size="sm" />
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-2xl mx-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-700 transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari barang yang kamu butuhkan..."
            className="w-full bg-zinc-100/90 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none border border-transparent focus:bg-white focus:border-zinc-200 focus:ring-4 focus:ring-zinc-900/[0.05] transition-all placeholder:text-zinc-400"
          />
        </form>

        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/#featured" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-black px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <Sparkles className="w-4 h-4" /> Pilihan
          </Link>
          <Link to="/cari" className="text-sm font-semibold text-zinc-700 hover:text-black px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
            Explore
          </Link>
        </nav>

        <button className="lg:hidden p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700" aria-label="Menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
