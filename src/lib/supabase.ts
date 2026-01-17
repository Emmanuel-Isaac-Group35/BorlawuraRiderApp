import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = 'https://whndyilpkdfhzrazcscd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobmR5aWxwa2RmaHpyYXpjc2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODgxOTQsImV4cCI6MjA4MzI2NDE5NH0.5maFPn5NL-7JwiYFeNI9TH46ni8AJvnPnDo0m-FOOws';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
