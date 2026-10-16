import { createClient } from '@supabase/supabase-js';

const LIVE_SUPABASE_URL = 'https://ryuxxtjzcvdxhgdtfdrk.supabase.co';
const LIVE_SUPABASE_ANON_KEY = 'sb_publishable_LjM-B9UJU-4c6KWrAuTakg_po_L0yAB';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
    ? import.meta.env.VITE_SUPABASE_URL
    : LIVE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : LIVE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
