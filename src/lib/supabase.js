import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env?.VITE_SUPABASE_URL;
const rawKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? import.meta.env?.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const sanitize = (v) => (typeof v === 'string' ? v : '')
  .trim()
  .replace(/^\s*"+|"+\s*$/g, '') // strip surrounding quotes
  .replace(/^=+/, ''); // strip any leading equals if mis-injected

const supabaseUrl = sanitize(rawUrl);
const supabaseAnonKey = sanitize(rawKey);

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
