import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const LIVE_SUPABASE_URL = 'https://ryuxxtjzcvdxhgdtfdrk.supabase.co';
const LIVE_SUPABASE_ANON_KEY = 'sb_publishable_LjM-B9UJU-4c6KWrAuTakg_po_L0yAB';

const supabaseUrl =
  process.env.SUPABASE_URL &&
  !process.env.SUPABASE_URL.includes('your-project-id') &&
  !process.env.SUPABASE_URL.includes('placeholder')
    ? process.env.SUPABASE_URL
    : LIVE_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role-key') &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : (process.env.SUPABASE_ANON_KEY || LIVE_SUPABASE_ANON_KEY);

// Service-role client (bypasses Row Level Security — for server use only)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
