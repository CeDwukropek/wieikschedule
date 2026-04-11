import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useUserId } from "./useUserId";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { db } from "../firebase/firebaseClient";

export function useSettings(settings) {
  const userId = useUserId();
  const { user, isLoading: isAuthLoading, isConfigured: isAuthConfigured } =
    useFirebaseAuth();
  const [hasHydrated, setHasHydrated] = useState(false);

  const SETTINGS_KEY = useMemo(
    () => `wieikschedule.${user?.uid || userId}.settings`,
    [user?.uid, userId],
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

  const [savedSettings, setSavedSettings] = useState(null);

  useEffect(() => {
    let active = true;
    setHasHydrated(false);

    const hydrateFromLocal = () => {
      const localSettings = readLocalSettings();
      if (!active) return;
      setSavedSettings(localSettings);
      setHasHydrated(true);
    };

    if (isAuthLoading) return () => {
      active = false;
    };

    if (!user?.uid || !isAuthConfigured || !db) {
      hydrateFromLocal();
      return () => {
        active = false;
      };
    }

    const settingsRef = doc(db, "userSettings", user.uid);

    getDoc(settingsRef)
      .then(async (snapshot) => {
        if (!active) return;

        if (snapshot.exists()) {
          const data = snapshot.data()?.settings;
          if (data && typeof data === "object") {
            setSavedSettings(data);
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
            setHasHydrated(true);
            return;
          }
        }

        const localSettings = readLocalSettings();
        if (!active) return;
        if (localSettings && typeof localSettings === "object") {
          setSavedSettings(localSettings);
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(localSettings));

          await setDoc(
            settingsRef,
            {
              settings: localSettings,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          ).catch((e) => {
            console.error("Failed to migrate local settings to cloud:", e);
          });
        } else {
          setSavedSettings(null);
        }

        if (active) {
          setHasHydrated(true);
        }
      })
      .catch((e) => {
        console.error("Failed to load cloud settings:", e);
        if (!active) return;
        hydrateFromLocal();
      });

    return () => {
      active = false;
    };
  }, [
    isAuthLoading,
    user,
    isAuthConfigured,
    SETTINGS_KEY,
    readLocalSettings,
  ]);

  return {
    savedSettings,
    isLoading: !hasHydrated,
  };
}

export function usePersistSettings(settings, enabled = true) {
  const userId = useUserId();
  const { user, isConfigured: isAuthConfigured } = useFirebaseAuth();
  const lastSavedSignatureRef = useRef("");

  const SETTINGS_KEY = useMemo(
    () => `wieikschedule.${user?.uid || userId}.settings`,
    [user?.uid, userId],
  );

  const settingsSignature = useMemo(() => JSON.stringify(settings || {}), [settings]);

  useEffect(() => {
    if (!enabled) return;
    if (!settings || typeof settings !== "object") return;
    if (!Object.keys(settings || {}).length) return;
    if (settingsSignature === lastSavedSignatureRef.current) return;

    lastSavedSignatureRef.current = settingsSignature;

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
  }, [
    settings,
    settingsSignature,
    SETTINGS_KEY,
    enabled,
    user,
    isAuthConfigured,
  ]);
}
