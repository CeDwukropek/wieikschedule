const { createClient } = require("@supabase/supabase-js");

// Supabase Admin client (service-role)
//
// Używane WYŁĄCZNIE po stronie API (serverless) do operacji wymagających
// uprawnień wyższych niż anon key (np. zapis do tabel user_added_events).
//
// Ważne:
// - Klient jest cachowany w pamięci procesu (na czas życia instancji funkcji).
// - Wyłączamy persistSession/autoRefreshToken, bo to środowisko serwerowe.

let cachedClient = null;

function getSupabaseAdminClient() {
  if (cachedClient) return cachedClient;

  const supabaseUrl = String(process.env.SUPABASE_URL || "").trim();
  const serviceRoleKey = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  ).trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

module.exports = {
  getSupabaseAdminClient,
};
