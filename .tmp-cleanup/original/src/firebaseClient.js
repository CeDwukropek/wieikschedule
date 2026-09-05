import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: String(process.env.REACT_APP_FIREBASE_API_KEY || "").trim(),
  authDomain: String(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: String(process.env.REACT_APP_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: String(
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  ).trim(),
  messagingSenderId: String(
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  ).trim(),
  appId: String(process.env.REACT_APP_FIREBASE_APP_ID || "").trim(),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;

// Expose auth/app for easy debugging in browser console during development
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  try {
    window.__WIEIK_AUTH = auth;
    window.__WIEIK_FIREBASE_APP = app;
  } catch (e) {
    // ignore
  }
}
