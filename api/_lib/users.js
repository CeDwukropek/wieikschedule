async function getUserIdByFirebaseUid(supabase, firebaseUid) {
  // Użytkownik może nie istnieć w tabeli `users` (np. pierwszy request).
  // Wtedy zwracamy pustą listę dopisanych eventów.
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("firebase_uid", firebaseUid)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id || null;
}

async function resolveUserIdByFirebaseUid(supabase, firebaseUid) {
  // Mapowanie użytkownika Firebase -> user_id w Supabase.
  // Upsert tworzy rekord w `users` przy pierwszym użyciu.
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        firebase_uid: firebaseUid,
      },
      {
        onConflict: "firebase_uid",
      },
    )
    .select("id")
    .single();

  if (error || !data?.id) {
    const err = new Error("Nie udalo sie przygotowac konta uzytkownika.");
    err.statusCode = 500;
    err.code = "USER_RESOLVE_FAILED";
    throw err;
  }

  return data.id;
}

module.exports = { getUserIdByFirebaseUid, resolveUserIdByFirebaseUid };
