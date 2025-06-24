
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isUrlPlaceholder = !supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL_HERE');
const isKeyPlaceholder = !supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY_HERE');

// This flag can be imported by other parts of the app to check if Supabase is properly configured.
export const isSupabaseConfigured = !isUrlPlaceholder && !isKeyPlaceholder;

if (!isSupabaseConfigured) {
  console.warn(
    '\n>>> Supabase environment variables are not set or are using placeholder values. <<<\n' +
    'Please create or check your .env.local file and add the following:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\n\n' +
    'The application will run with mock functionality, but database operations will be disabled.\n'
  );
}

// Initialize with valid (but non-functional) placeholders if the real ones are missing or are placeholders.
// This allows the app to build and run without crashing due to an "Invalid URL" error.
export const supabase: SupabaseClient<Database> = createClient<Database>(
  isUrlPlaceholder ? 'http://localhost:54321' : supabaseUrl,
  isKeyPlaceholder ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' : supabaseAnonKey
);
