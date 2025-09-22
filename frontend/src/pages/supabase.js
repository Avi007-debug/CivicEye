import { createClient } from '@supabase/supabase-js';

// It's best to store these in environment variables.
// Create a .env.local file in your project root and add these variables.
// For Create React App, they must start with REACT_APP_
// REACT_APP_SUPABASE_URL=your-supabase-url
// REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL and/or Anon Key are missing. Please check your .env file.");
  // You might want to throw an error here or handle it gracefully
  // throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);