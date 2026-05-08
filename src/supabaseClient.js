import { createClient } from "@supabase/supabase-js";

// Przeglądarkowy klient Supabase (anon)
//
// Wykorzystywany do pobierania eventów/planów (tabela `events`).
// Operacje wymagające zapisu do tabel użytkownika są wykonywane przez API
// z service-role key (zob. api/_lib/supabaseAdmin.js).

const supabaseUrl = String(process.env.REACT_APP_SUPABASE_URL || "").trim();
const supabaseAnonKey = String(
  process.env.REACT_APP_SUPABASE_ANON_KEY || "",
).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
