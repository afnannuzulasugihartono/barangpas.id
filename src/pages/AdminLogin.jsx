import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import Logo from '../components/Logo';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.ok) navigate('/admin');
    else setError(result.error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFE4EC] to-[#FFFAFC] flex items-center justify-center px-4">
      <title>Admin Login — barangpas</title>
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(255,150,180,0.25)] p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <Logo size="md" />
          <p className="text-xs text-[#B98599] mt-1">Dashboard Admin</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF9DBE]" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-[#FFF3F7] rounded-full pl-9 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE]"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF9DBE]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#FFF3F7] rounded-full pl-9 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-[#FF9DBE]"
            />
          </div>
          {error && <p className="text-xs text-[#D6335E] font-medium text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6FA5] hover:bg-[#FF4F91] disabled:opacity-70 text-white font-heading text-base py-2.5 rounded-full shadow-md transition-colors"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
