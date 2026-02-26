import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function readEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

const firebaseConfig = {
  apiKey: readEnv("REACT_APP_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: readEnv(
    "REACT_APP_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  ),
  projectId: readEnv(
    "REACT_APP_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ),
  storageBucket: readEnv(
    "REACT_APP_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_STORAGEBUCKET",
  ),
  messagingSenderId: readEnv(
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID",
  ),
  appId: readEnv(
    "REACT_APP_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_APPID",
  ),
  measurementId: readEnv(
    "REACT_APP_FIREBASE_MEASUREMENT_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENTID",
  ),
};

export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

if (!firebaseEnabled && process.env.NODE_ENV !== "production") {
  const requiredKeys = [
    "REACT_APP_FIREBASE_API_KEY",
    "REACT_APP_FIREBASE_AUTH_DOMAIN",
    "REACT_APP_FIREBASE_PROJECT_ID",
    "REACT_APP_FIREBASE_APP_ID",
  ];

  const missingKeys = requiredKeys.filter((key) => {
    const value = process.env[key];
    return !(typeof value === "string" && value.trim());
  });

  console.warn(
    `[firebase] Missing Firebase env config. In this CRA app use REACT_APP_* vars. Missing: ${missingKeys.join(", ") || "(unknown)"}`,
  );
}

const app = firebaseEnabled
  ? getApps()[0] || initializeApp(firebaseConfig)
  : null;

export const db = app ? getFirestore(app) : null;
