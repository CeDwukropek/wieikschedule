const admin = require("firebase-admin");

function getServiceAccountFromEnv() {
  const projectId = String(process.env.FIREBASE_PROJECT_ID || "").trim();
  const clientEmail = String(process.env.FIREBASE_CLIENT_EMAIL || "").trim();
  const privateKeyRaw = String(process.env.FIREBASE_PRIVATE_KEY || "").trim();

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin credentials in environment.");
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function getFirebaseAdminAuth() {
  if (!admin.apps.length) {
    const serviceAccount = getServiceAccountFromEnv();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
  }

  return admin.auth();
}

module.exports = {
  getFirebaseAdminAuth,
};
