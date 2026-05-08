const { getFirebaseAdminAuth } = require("./firebaseAdmin");

function getBearerToken(req) {
  // Odczytuje token z nagłówka: Authorization: Bearer <idToken>
  const authHeader = String(req.headers.authorization || "").trim();
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return authHeader.slice(7).trim();
}

async function verifyRequestUser(req) {
  // Weryfikuje Firebase ID token i zwraca uid użytkownika.
  // Rzuca błąd z { statusCode: 401, code: 'UNAUTHORIZED' } jeśli brak/niepoprawny.
  const token = getBearerToken(req);

  if (!token) {
    const error = new Error("Brak tokenu autoryzacyjnego.");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(token);
    const uid = String(decoded?.uid || "").trim();

    if (!uid) {
      const error = new Error("Nieprawidlowy token uzytkownika.");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }

    return { uid };
  } catch (err) {
    // Temporary: log auth verification details in dev
    console.error("verifyIdToken failed", err?.code || "", err?.message || "");
    const error = new Error(
      "Nie udalo sie zweryfikowac tozsamosci uzytkownika.",
    );
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }
}

module.exports = {
  verifyRequestUser,
};
