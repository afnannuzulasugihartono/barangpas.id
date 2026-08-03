import { Sparkles, Shirt, Smartphone, House, Tag } from 'lucide-react';

// Maps the string stored in categories.icon (see supabase migration) to an
// actual lucide-react component. Falls back to a generic tag icon so a new
// category added without a matching entry here still renders something,
// instead of printing the raw icon name as text.
const ICON_MAP = {
  Sparkles,
  Shirt,
  Smartphone,
  House,
};

export default function CategoryIcon({ name, className = 'w-4 h-4' }) {
  const Icon = ICON_MAP[name] || Tag;
  return <Icon className={className} />;
}
