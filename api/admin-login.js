import supabase from './db-client.js';
import { verifyPassword, createSessionToken } from '../src/lib/adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });

      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();
      if (error || !admin) return res.status(401).json({ error: 'Username atau password salah' });

      const valid = verifyPassword(password, admin.salt, admin.password_hash);
      if (!valid) return res.status(401).json({ error: 'Username atau password salah' });

      const token = createSessionToken(username);
      return res.status(200).json({ token, username });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
