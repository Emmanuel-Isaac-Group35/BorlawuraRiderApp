import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = 'https://kpdyklcickeqmybngpea.supabase.co';
const supabaseAnonKey = 'sb_publishable_P_X0MALYbZjnPRkEHse_Vg_jTFaMzGG'
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Key is missing!');
} else {
  console.log('Initializing Supabase with URL:', supabaseUrl); // Do not log key for security, but we know it's hardcoded here
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
