import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useUserId } from "./useUserId";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { db } from "../firebase/firebaseClient";

export function useSettings() {
  const userId = useUserId();
  const { user, isConfigured: isAuthConfigured } = useFirebaseAuth();
  const previousUserUidRef = useRef(null);

  const SETTINGS_KEY = useMemo(
    () => `wieikschedule.${user?.uid || userId}.settings`,
    [user?.uid, userId],
  );
  const GUEST_SETTINGS_KEY = useMemo(
    () => `wieikschedule.${userId}.settings`,
    [userId],
  );

  const readSettingsFromKey = useCallback((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return null;
  }, []);

  const readLocalSettings = useCallback(() => {
    const byUserKey = readSettingsFromKey(SETTINGS_KEY);
    if (byUserKey && typeof byUserKey === "object") return byUserKey;

    // After login, user-scoped key changes to uid. Keep guest snapshot as fallback.
    const byGuestKey = readSettingsFromKey(GUEST_SETTINGS_KEY);
    if (byGuestKey && typeof byGuestKey === "object") return byGuestKey;

    return null;
  }, [SETTINGS_KEY, GUEST_SETTINGS_KEY, readSettingsFromKey]);

  const [savedSettings, setSavedSettings] = useState(() => readLocalSettings());

  useEffect(() => {
    const currentUserUid = user?.uid || null;
    const previousUserUid = previousUserUidRef.current;

    if (
      previousUserUid &&
      !currentUserUid &&
      savedSettings &&
      typeof savedSettings === "object"
    ) {
      try {
        localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(savedSettings));
      } catch (e) {
        console.error("Failed to cache settings on logout:", e);
      }
    }

    previousUserUidRef.current = currentUserUid;
  }, [user?.uid, savedSettings, GUEST_SETTINGS_KEY]);

  useEffect(() => {
    let active = true;

    const hydrateFromLocal = () => {
      const localSettings = readLocalSettings();
      if (!active) return;
      setSavedSettings(localSettings);
    };

    // Always hydrate from localStorage first and keep it as the source of truth for UI.
    hydrateFromLocal();

    if (!user?.uid || !isAuthConfigured || !db) {
      return () => {
        active = false;
      };
    }

    // If user-scoped cache is missing but guest snapshot exists, promote it after login.
    try {
      const userScopedLocalSettings = readSettingsFromKey(SETTINGS_KEY);
      const guestLocalSettings = readSettingsFromKey(GUEST_SETTINGS_KEY);

      if (
        (!userScopedLocalSettings ||
          typeof userScopedLocalSettings !== "object") &&
        guestLocalSettings &&
        typeof guestLocalSettings === "object"
      ) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(guestLocalSettings));
        if (active) {
          setSavedSettings(guestLocalSettings);
        }
      }
    } catch (e) {
      console.error("Failed to promote guest settings after login:", e);
    }

    return () => {
      active = false;
    };
  }, [
    user,
    isAuthConfigured,
    SETTINGS_KEY,
    GUEST_SETTINGS_KEY,
    readSettingsFromKey,
    readLocalSettings,
  ]);

  return {
    savedSettings,
    isLoading: false,
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
  const GUEST_SETTINGS_KEY = useMemo(
    () => `wieikschedule.${userId}.settings`,
    [userId],
  );

  const settingsSignature = useMemo(
    () => JSON.stringify(settings || {}),
    [settings],
  );

  useEffect(() => {
    if (!enabled) return;
    if (!settings || typeof settings !== "object") return;
    if (!Object.keys(settings || {}).length) return;
    if (settingsSignature === lastSavedSignatureRef.current) return;

    lastSavedSignatureRef.current = settingsSignature;

    try {
      const serialized = JSON.stringify(settings);
      localStorage.setItem(SETTINGS_KEY, serialized);
      localStorage.setItem(GUEST_SETTINGS_KEY, serialized);

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
    GUEST_SETTINGS_KEY,
    enabled,
    user,
    isAuthConfigured,
  ]);
}
