import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: String(process.env.REACT_APP_FIREBASE_API_KEY || "").trim(),
  authDomain: String(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: String(process.env.REACT_APP_FIREBASE_PROJECT_ID || "").trim(),
  appId: String(process.env.REACT_APP_FIREBASE_APP_ID || "").trim(),
  messagingSenderId: String(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  storageBucket: String(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "").trim(),
  measurementId: String(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "").trim(),
};

const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];

const isFirebaseConfigured = requiredKeys.every((key) =>
  Boolean(firebaseConfig[key]),
);

let auth = null;
let googleProvider = null;
let db = null;

if (isFirebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
}

export { auth, db, googleProvider, isFirebaseConfigured };
