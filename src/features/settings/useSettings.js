import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useGuestId } from "../auth/useGuestId";
import { useFirebaseAuth } from "../auth/useFirebaseAuth";
import { db } from "../../lib/firebaseClient";

function readSettings(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === "object" ? value : null;
  } catch (error) {
    console.error("Failed to load settings:", error);
    return null;
  }
}

// Firestore can return map keys in a different order from the UI payload.
function serializeSettings(value) {
  return JSON.stringify(value, (_key, item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]]));
    }
    return item;
  });
}

// The viewed week belongs to this device; syncing it would write to Firestore on every week change.
const LOCAL_ONLY = ["weekOffset"];
const cloudPart = (value) => Object.fromEntries(Object.entries(value || {}).filter(([key]) => !LOCAL_ONLY.includes(key)));
const localPart = (value) => Object.fromEntries(Object.entries(value || {}).filter(([key]) => LOCAL_ONLY.includes(key)));
// What Firestore holds for the account, so unchanged settings are not written again.
const cloudKey = (uid) => `wieikschedule.${uid}.cloudSignature`;
function readCloudSignature(uid) {
  try { return localStorage.getItem(cloudKey(uid)); } catch { return null; }
}
function storeCloudSignature(uid, signature) {
  try { localStorage.setItem(cloudKey(uid), signature); } catch { /* the next save simply writes again */ }
}

// The account last signed in on this device. Firebase takes a moment to restore the session; until then the
// app shows that account's saved settings (its plan and groups) instead of a guest's first plan.
const LAST_ACCOUNT_KEY = "wieikschedule.lastAccount";
function readLastAccount() {
  try { return localStorage.getItem(LAST_ACCOUNT_KEY) || ""; } catch { return ""; }
}
function storeLastAccount(uid) {
  try { if (uid) localStorage.setItem(LAST_ACCOUNT_KEY, uid); else localStorage.removeItem(LAST_ACCOUNT_KEY); }
  catch { /* the next start just waits for the session */ }
}

export function useSettings() {
  const guestId = useGuestId();
  const { user, isLoading: authLoading, isConfigured } = useFirebaseAuth();
  const uid = authLoading ? readLastAccount() : user?.uid;
  const settingsKey = `wieikschedule.${uid || guestId}.settings`;
  useEffect(() => { if (!authLoading) storeLastAccount(user?.uid); }, [authLoading, user?.uid]);
  const [hydration, setHydration] = useState(() => ({
    key: settingsKey, settings: readSettings(settingsKey) || {}, ready: false,
  }));

  useEffect(() => {
    if (authLoading) return;
    const local = readSettings(settingsKey) || {};
    if (!uid || !isConfigured || !db) {
      setHydration({ key: settingsKey, settings: local, ready: true });
      return;
    }

    setHydration({ key: settingsKey, settings: local, ready: false });
    let hydrated = false;
    // A cached snapshot cannot establish whether another device has newer settings.
    return onSnapshot(doc(db, "userSettings", uid), { includeMetadataChanges: true }, snapshot => {
      if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
      const remote = snapshot.exists() ? snapshot.data()?.settings : null;
      if (remote) storeCloudSignature(uid, serializeSettings(cloudPart(remote)));
      const settings = remote ? { ...cloudPart(remote), ...localPart(readSettings(settingsKey)) } : local;
      // Our own writes are already reflected in the UI; do not replay them.
      if (hydrated && serializeSettings(cloudPart(remote)) === serializeSettings(cloudPart(readSettings(settingsKey)))) return;
      hydrated = true;
      if (settings) {
        try {
          localStorage.setItem(settingsKey, serializeSettings(settings));
        } catch (error) {
          console.error("Failed to cache cloud settings:", error);
        }
      }
      setHydration({ key: settingsKey, settings, ready: true });
    }, error => {
      // A failed initial read must not allow defaults to overwrite cloud sets.
      console.error("Failed to load settings from Firestore:", error);
    });
  }, [authLoading, uid, isConfigured, settingsKey]);

  return {
    savedSettings: hydration.key === settingsKey ? hydration.settings : readSettings(settingsKey) || {},
    isLoading: Boolean(authLoading) || hydration.key !== settingsKey || !hydration.ready,
  };
}

export function usePersistSettings(settings, enabled = true) {
  const guestId = useGuestId();
  const { user, isLoading: authLoading, isConfigured } = useFirebaseAuth();
  const uid = user?.uid;
  const settingsKey = `wieikschedule.${uid || guestId}.settings`;
  const lastSavedSignatureRef = useRef("");
  const signature = serializeSettings([settingsKey, settings]);

  useEffect(() => {
    if (!enabled || authLoading || !settings || !Object.keys(settings).length) return;
    if (signature === lastSavedSignatureRef.current) return;

    // Allow hydration effects to render first and cancel stale writes on changes.
    const timer = setTimeout(() => {
      const serialized = serializeSettings(settings);
      try {
        localStorage.setItem(settingsKey, serialized);
        if (!uid || !isConfigured || !db) {
          lastSavedSignatureRef.current = signature;
          return;
        }
        const cloud = cloudPart(settings);
        const cloudSignature = serializeSettings(cloud);
        if (readCloudSignature(uid) === cloudSignature) {
          lastSavedSignatureRef.current = signature;
          return;
        }
        // Replace the settings map so deleting sets also removes them remotely.
        setDoc(doc(db, "userSettings", uid), {
          settings: cloud, updatedAt: serverTimestamp(),
        }).then(() => {
          storeCloudSignature(uid, cloudSignature);
          lastSavedSignatureRef.current = signature;
        }).catch(error => {
          console.error("Failed to save cloud settings:", error);
        });
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [settings, signature, settingsKey, enabled, authLoading, uid, isConfigured]);
}
