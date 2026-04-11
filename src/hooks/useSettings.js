import { useMemo, useEffect, useState, useCallback } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useUserId } from "./useUserId";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { db } from "../firebase/firebaseClient";

export function useSettings(settings) {
  const userId = useUserId();
  const { user, isConfigured: isAuthConfigured } = useFirebaseAuth();
  const shouldPersist =
    Boolean(settings) && Object.keys(settings || {}).length > 0;

  const SETTINGS_KEY = useMemo(
    () => `wieikschedule.${userId}.settings`,
    [userId],
  );

  const readLocalSettings = useCallback(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return null;
  }, [SETTINGS_KEY]);

  const [savedSettings, setSavedSettings] = useState(() => readLocalSettings());

  useEffect(() => {
    setSavedSettings(readLocalSettings());
  }, [readLocalSettings]);

  // If user is logged in, prefer cloud settings and update local cache.
  useEffect(() => {
    if (shouldPersist) return;
    if (!user?.uid || !isAuthConfigured || !db) return;

    let active = true;
    const settingsRef = doc(db, "userSettings", user.uid);

    getDoc(settingsRef)
      .then((snapshot) => {
        if (!active || !snapshot.exists()) return;
        const data = snapshot.data()?.settings;
        if (!data || typeof data !== "object") return;
        setSavedSettings(data);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
      })
      .catch((e) => {
        console.error("Failed to load cloud settings:", e);
      });

    return () => {
      active = false;
    };
  }, [shouldPersist, user, isAuthConfigured, SETTINGS_KEY]);

  // Persist settings whenever they change: cloud for logged-in user, local for guest.
  useEffect(() => {
    if (!shouldPersist) return;

    try {
      const serialized = JSON.stringify(settings);
      localStorage.setItem(SETTINGS_KEY, serialized);

      if (user?.uid && isAuthConfigured && db) {
        const settingsRef = doc(db, "userSettings", user.uid);
        setDoc(
          settingsRef,
          {
            settings,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        ).catch((e) => {
          console.error("Failed to save cloud settings:", e);
        });
      }
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings, SETTINGS_KEY, shouldPersist, user, isAuthConfigured]);

  return savedSettings;
}
