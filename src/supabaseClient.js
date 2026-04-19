import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(process.env.REACT_APP_SUPABASE_URL || "").trim();
const supabaseAnonKey = String(
  process.env.REACT_APP_SUPABASE_ANON_KEY || "",
).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
