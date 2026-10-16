import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project-id')
  ? process.env.SUPABASE_URL
  : 'https://placeholder.supabase.co';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role-key')
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : 'placeholder-service-role-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.log('⚠️ Running with placeholder Supabase configuration. For live database sync, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Service-role client (bypasses Row Level Security — for server use only)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
