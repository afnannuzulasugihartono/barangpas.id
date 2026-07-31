import supabase from './db-client.js';
import { verifySessionToken } from '../src/lib/adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!verifySessionToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const { data: products, error: pErr } = await supabase
        .from('products')
        .select('id, name, click_count, category, is_active, is_featured')
        .order('click_count', { ascending: false });
      if (pErr) throw pErr;

      const { data: logs, error: lErr } = await supabase
        .from('click_logs')
        .select('referrer_source')
        .not('referrer_source', 'is', null);
      if (lErr) throw lErr;

      const sourceBreakdown = {};
      for (const log of logs || []) {
        const src = log.referrer_source || 'unknown';
        sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
      }

      const totalClicks = (products || []).reduce((sum, p) => sum + (p.click_count || 0), 0);

      return res.status(200).json({ products, sourceBreakdown, totalClicks });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
