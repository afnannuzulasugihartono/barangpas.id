import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { product_id, referrer_source } = req.body;
      if (!product_id) return res.status(400).json({ error: 'Missing product_id' });

      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('affiliate_url, click_count')
        .eq('id', product_id)
        .single();
      if (fetchError) throw fetchError;
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const { error: logError } = await supabase
        .from('click_logs')
        .insert({ product_id, referrer_source: referrer_source || null });
      if (logError) throw logError;

      const { error: updateError } = await supabase
        .from('products')
        .update({ click_count: (product.click_count || 0) + 1 })
        .eq('id', product_id);
      if (updateError) throw updateError;

      return res.status(200).json({ affiliate_url: product.affiliate_url });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
