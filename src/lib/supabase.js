import { createClient } from '@supabase/supabase-js';

// Try multiple sources for runtime configuration: build-time import.meta.env, global variables
const getRuntimeVar = (name) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) return import.meta.env[name];
  } catch {}
  try {
    if (typeof globalThis !== 'undefined' && globalThis[name]) return globalThis[name];
  } catch {}
  try {
    if (typeof window !== 'undefined' && window[name]) return window[name];
  } catch {}
  try {
    if (typeof globalThis !== 'undefined' && globalThis.__ENV__ && globalThis.__ENV__[name]) return globalThis.__ENV__[name];
  } catch {}
  try {
    if (typeof document !== 'undefined') {
      const m = document.querySelector(`meta[name="${name}"]`);
      if (m && m.content) return m.content;
    }
  } catch {}
  return undefined;
};

const rawUrl = getRuntimeVar('VITE_SUPABASE_URL');
const rawKey = getRuntimeVar('VITE_SUPABASE_ANON_KEY') ?? getRuntimeVar('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') ?? getRuntimeVar('VITE_SUPABASE_PUBLISHABLE_KEY');

const sanitize = (v) => (typeof v === 'string' ? v : '')
  .trim()
  .replace(/^\s*"+|"+\s*$/g, '')
  .replace(/^=+/, '');

const supabaseUrl = sanitize(rawUrl);
const supabaseAnonKey = sanitize(rawKey);

const isValidUrl = /^https?:\/\//i.test(supabaseUrl);

const createError = (msg) => new Error(`Supabase not configured: ${msg}`);

// Create a lightweight stub that mirrors the parts of the supabase client the app uses.
const createStubSupabase = (message) => {
  const err = createError(message);
  const promiseErr = async () => ({ data: null, error: err });
  const chainable = () => ({ select: promiseErr, insert: promiseErr, update: promiseErr, delete: promiseErr, eq: chainable, order: chainable, single: promiseErr, limit: chainable, in: chainable });
  return {
    // auth helpers
    auth: {
      getUser: async () => ({ data: { user: null }, error: err }),
      getSession: async () => ({ data: { session: null }, error: err }),
      signInWithPassword: async () => ({ data: null, error: { message } }),
      signOut: async () => ({ error: { message } }),
      onAuthStateChange: (cb) => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => chainable(),
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        upload: async () => ({ data: null, error: err }),
        remove: async () => ({ data: null, error: err }),
        list: async () => ({ data: [], error: err }),
        download: async () => ({ data: null, error: err })
      })
    },
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: () => {},
  };
};

let supabaseClient;
if (!isValidUrl || !supabaseAnonKey) {
  const details = `URL='${supabaseUrl}' KEY_LEN=${supabaseAnonKey?.length || 0}`;
  console.error('Supabase configuration invalid or missing.', details);
  supabaseClient = createStubSupabase('Missing or invalid Supabase environment variables. ' + details);
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: true, persistSession: true }
  });
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = isValidUrl && !!supabaseAnonKey;
