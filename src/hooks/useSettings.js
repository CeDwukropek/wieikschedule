import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useUserId } from "./useUserId";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { db } from "../firebase/firebaseClient";

export function useSettings(options = {}) {
  const { resolveCloudConflict } = options || {};
  const userId = useUserId();
  const {
    user,
    isLoading: isAuthLoading,
    isConfigured: isAuthConfigured,
  } = useFirebaseAuth();
  const promptHandledUidRef = useRef("");
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

    if (previousUserUid !== currentUserUid) {
      promptHandledUidRef.current = "";
    }

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

    if (isAuthLoading)
      return () => {
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

        const userScopedLocalSettings = readSettingsFromKey(SETTINGS_KEY);
        const guestLocalSettings = readSettingsFromKey(GUEST_SETTINGS_KEY);

        let localSettings =
          userScopedLocalSettings && typeof userScopedLocalSettings === "object"
            ? userScopedLocalSettings
            : null;

        // Prefer guest snapshot after login when it differs from stale uid-scoped cache.
        if (guestLocalSettings && typeof guestLocalSettings === "object") {
          if (!localSettings) {
            localSettings = guestLocalSettings;
          } else {
            const guestSig = JSON.stringify(guestLocalSettings);
            const userSig = JSON.stringify(localSettings);
            if (guestSig !== userSig) {
              localSettings = guestLocalSettings;
            }
          }
        }

        if (!active) return;

        if (snapshot.exists()) {
          const cloudSettings = snapshot.data()?.settings;
          if (cloudSettings && typeof cloudSettings === "object") {
            const hasPromptForUid = promptHandledUidRef.current === user.uid;
            const hasLocalSettings =
              localSettings && typeof localSettings === "object";

            let useCloud = true;
            if (!hasPromptForUid && hasLocalSettings) {
              const cloudSignature = JSON.stringify(cloudSettings);
              const localSignature = JSON.stringify(localSettings);
              if (cloudSignature !== localSignature) {
                let decision = "cloud";
                if (typeof resolveCloudConflict === "function") {
                  try {
                    decision = await resolveCloudConflict({
                      cloudSettings,
                      localSettings,
                    });
                  } catch (e) {
                    decision = "cloud";
                  }
                } else {
                  decision = window.confirm(
                    "Masz zapisane ustawienia w Firebase. Czy chcesz je zaciągnąć do aplikacji?\n\nKliknij Anuluj, aby zostawić lokalne i nadpisać nimi Firebase.",
                  )
                    ? "cloud"
                    : "local";
                }
                useCloud = decision !== "local";
              }
              promptHandledUidRef.current = user.uid;
            }

            if (useCloud || !hasLocalSettings) {
              setSavedSettings(cloudSettings);
              localStorage.setItem(SETTINGS_KEY, JSON.stringify(cloudSettings));
              // Cloud selected; clear old guest snapshot to avoid future false conflicts.
              localStorage.removeItem(GUEST_SETTINGS_KEY);
              return;
            }

            // User chose local settings; overwrite cloud with local snapshot.
            setSavedSettings(localSettings);
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(localSettings));
            localStorage.removeItem(GUEST_SETTINGS_KEY);
            await setDoc(
              settingsRef,
              {
                settings: localSettings,
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            ).catch((e) => {
              console.error("Failed to sync local settings to cloud:", e);
            });
            return;
          }
        }

        if (localSettings && typeof localSettings === "object") {
          setSavedSettings(localSettings);
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(localSettings));
          localStorage.removeItem(GUEST_SETTINGS_KEY);

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
          // Keep current local snapshot if there is one; avoid flashing defaults.
          setSavedSettings((prev) => prev || null);
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
    GUEST_SETTINGS_KEY,
    readSettingsFromKey,
    readLocalSettings,
    resolveCloudConflict,
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
