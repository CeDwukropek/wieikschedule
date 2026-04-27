const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function loadEnvFileIfExists(fileName) {
  const envPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

function loadLocalEnvIfMissing() {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return;
  }

  // Vercel dev sometimes skips .env.local for serverless runtime
  loadEnvFileIfExists(".env.local");
  loadEnvFileIfExists(".env.development.local");
}

function getServiceAccountFromEnv() {
  loadLocalEnvIfMissing();

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
