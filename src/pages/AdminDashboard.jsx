import { useEffect, useState } from 'react';
import { LogOut, Plus, Pencil, Trash2, BarChart3, Eye, EyeOff, X } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { formatRupiah, platformInfo } from '../lib/format';

const emptyForm = {
  name: '', description: '', price: '', image_url: '', category: 'kosmetik',
  affiliate_platform: 'shopee', affiliate_url: '', is_featured: false, is_active: true,
};

export default function AdminDashboard() {
  const { token, username, logout } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?admin=true'),
        fetch('/api/categories'),
      ]);
      if (!prodRes.ok || !catRes.ok) throw new Error('Gagal memuat data');
      setProducts(await prodRes.json());
      setCategories(await catRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin-analytics', { headers: authHeaders });
      if (!res.ok) throw new Error('Gagal memuat analitik');
      setAnalytics(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); loadAnalytics(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '', price: p.price, image_url: p.image_url || '',
      category: p.category, affiliate_platform: p.affiliate_platform, affiliate_url: p.affiliate_url,
      is_featured: p.is_featured, is_active: p.is_active,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.affiliate_url) {
      alert('Nama, harga, dan URL afiliasi wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      const res = editingId
        ? await fetch('/api/products', { method: 'PUT', headers: authHeaders, body: JSON.stringify({ id: editingId, ...payload }) })
        : await fetch('/api/products', { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Gagal menyimpan produk');
      }
      setShowForm(false);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p) => {
    await fetch('/api/products', { method: 'PUT', headers: authHeaders, body: JSON.stringify({ id: p.id, is_active: !p.is_active }) });
    load();
  };

  const remove = async (p) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    await fetch('/api/products', { method: 'DELETE', headers: authHeaders, body: JSON.stringify({ id: p.id }) });
    load();
  };

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-[#FFFAFC]">
      <title>Dashboard Admin — barangpas</title>
      <header className="bg-white border-b border-[#FFE4EC] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#B98599] hidden sm:block">Halo, {username}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs font-semibold text-[#FF6FA5] bg-[#FFE4EC] px-3 py-2 rounded-full">
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('products')} className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'products' ? 'bg-[#FF6FA5] text-white' : 'bg-white border border-[#FFE4EC] text-[#8A6373]'}`}>Produk</button>
          <button onClick={() => setTab('analytics')} className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 ${tab === 'analytics' ? 'bg-[#FF6FA5] text-white' : 'bg-white border border-[#FFE4EC] text-[#8A6373]'}`}>
            <BarChart3 className="w-4 h-4" /> Analitik
          </button>
        </div>

        {error && <ErrorState message={error} onRetry={load} />}

        {tab === 'products' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl text-[#2D2D2D]">Kelola Produk ({products.length})</h2>
              <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#FF6FA5] hover:bg-[#FF4F91] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
                <Plus className="w-4 h-4" /> Tambah Produk
              </button>
            </div>

            {loading ? <Loading /> : (
              <div className="space-y-2">
                {products.map((p) => {
                  const platform = platformInfo(p.affiliate_platform);
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-[#FFEDF3] p-3 flex items-center gap-3">
                      <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-[#FFF3F7] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2D2D2D] truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-[#FF6FA5] font-bold">{formatRupiah(p.price)}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: platform.bg, color: platform.color }}>{platform.label}</span>
                          <span className="text-[10px] text-[#B98599]">🖱️ {p.click_count || 0}</span>
                          {!p.is_active && <span className="text-[10px] font-bold text-[#B9455B] bg-[#FFE0E7] px-2 py-0.5 rounded-full">Nonaktif</span>}
                          {p.is_featured && <span className="text-[10px] font-bold text-[#FF6FA5] bg-[#FFE4EC] px-2 py-0.5 rounded-full">Unggulan</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => toggleActive(p)} title={p.is_active ? 'Nonaktifkan' : 'Aktifkan'} className="w-8 h-8 rounded-full bg-[#FFF3F7] flex items-center justify-center text-[#8A6373]">
                          {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(p)} title="Edit" className="w-8 h-8 rounded-full bg-[#FFF3F7] flex items-center justify-center text-[#8A6373]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(p)} title="Hapus" className="w-8 h-8 rounded-full bg-[#FFE0E7] flex items-center justify-center text-[#D6335E]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'analytics' && (
          <div>
            <h2 className="font-heading text-xl text-[#2D2D2D] mb-4">Analitik Klik</h2>
            {!analytics ? <Loading /> : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-white rounded-2xl border border-[#FFEDF3] p-4">
                    <p className="text-xs text-[#B98599]">Total Klik</p>
                    <p className="font-heading text-2xl text-[#FF6FA5]">{analytics.totalClicks}</p>
                  </div>
                  {Object.entries(analytics.sourceBreakdown || {}).map(([src, count]) => (
                    <div key={src} className="bg-white rounded-2xl border border-[#FFEDF3] p-4">
                      <p className="text-xs text-[#B98599] capitalize">Sumber: {src}</p>
                      <p className="font-heading text-2xl text-[#FF6FA5]">{count}</p>
                    </div>
                  ))}
                </div>
                <h3 className="font-heading text-lg text-[#2D2D2D] mb-3">Klik per Produk</h3>
                <div className="space-y-2">
                  {analytics.products.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl border border-[#FFEDF3] p-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2D2D2D] truncate">{p.name}</span>
                      <span className="text-sm font-bold text-[#FF6FA5] shrink-0 ml-2">{p.click_count || 0} klik</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl text-[#2D2D2D]">{editingId ? 'Edit Produk' : 'Tambah Produk'}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-[#FFF3F7] flex items-center justify-center">
                <X className="w-4 h-4 text-[#8A6373]" />
              </button>
            </div>
            <form onSubmit={submitForm} className="space-y-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama produk" className="w-full bg-[#FFF3F7] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE]" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi" rows={3} className="w-full bg-[#FFF3F7] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE] resize-none" />
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Harga (Rp)" className="w-full bg-[#FFF3F7] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE]" />
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL Gambar" className="w-full bg-[#FFF3F7] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE]" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-[#FFF3F7] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE]">
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
              <select value={form.affiliate_platform} onChange={(e) => setForm({ ...form, affiliate_platform: e.target.value })} className="w-full bg-[#FFF3F7] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE]">
                <option value="shopee">Shopee</option>
                <option value="tiktok">TikTok Shop</option>
                <option value="tokopedia">Tokopedia</option>
                <option value="lazada">Lazada</option>
              </select>
              <input required value={form.affiliate_url} onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })} placeholder="URL Afiliasi" className="w-full bg-[#FFF3F7] rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE]" />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-[#6B5560]">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-[#FF6FA5]" /> Unggulan
                </label>
                <label className="flex items-center gap-2 text-sm text-[#6B5560]">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-[#FF6FA5]" /> Aktif
                </label>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-[#FF6FA5] hover:bg-[#FF4F91] disabled:opacity-70 text-white font-heading text-base py-3 rounded-full shadow-md transition-colors">
                {saving ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
