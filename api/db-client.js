import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './db-wake.js';

// Keep the API resilient across Vercel environments. Preview deployments can
// sometimes have only the Vite-prefixed public variables configured, while the
// serverless API historically used NEXT_PUBLIC_SUPABASE_URL.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://ignmxvommfnkllcpliuw.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('Supabase API key is not configured in Vercel environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: async (url, options) => {
      const res = await fetch(url, options);
      if (!res.ok && res.status >= 500) triggerRestore();
      return res;
    },
  },
});

export default supabase;
