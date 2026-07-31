import supabase from './db-client.js';
import { verifySessionToken } from '../src/lib/adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { category, featured, admin } = req.query;
      let query = supabase.from('products').select('*');

      if (!admin) {
        query = query.eq('is_active', true);
      }
      if (category) {
        query = query.eq('category', category);
      }
      if (featured === 'true') {
        query = query.eq('is_featured', true);
      }
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifySessionToken(token)) return res.status(401).json({ error: 'Unauthorized' });

      const { name, description, price, image_url, category, affiliate_platform, affiliate_url, is_featured, is_active } = req.body;
      if (!name || !price || !category || !affiliate_platform || !affiliate_url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const { data, error } = await supabase
        .from('products')
        .insert({ name, description, price, image_url, category, affiliate_platform, affiliate_url, is_featured: !!is_featured, is_active: is_active !== false })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifySessionToken(token)) return res.status(401).json({ error: 'Unauthorized' });

      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { data, error } = await supabase
        .from('products')
        .update(fields)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifySessionToken(token)) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
