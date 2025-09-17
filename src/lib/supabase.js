import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env?.VITE_SUPABASE_URL;
const rawKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (typeof rawUrl === 'string' ? rawUrl : '').trim().replace(/^"+|"+$/g, '');
const supabaseAnonKey = (typeof rawKey === 'string' ? rawKey : '').trim().replace(/^"+|"+$/g, '');

const isValidUrl = /^https?:\/\//i.test(supabaseUrl);
if (!isValidUrl || !supabaseAnonKey) {
  const details = import.meta.env?.DEV ? ` URL='${supabaseUrl}' KEY_LEN=${supabaseAnonKey?.length || 0}` : '';
  throw new Error('Missing or invalid Supabase environment variables.' + details);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});
