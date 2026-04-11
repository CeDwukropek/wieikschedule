import { useCallback, useEffect, useState } from "react";
import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
} from "../firebase/firebaseClient";

export function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    setPersistence(auth, browserLocalPersistence).catch((error) => {
      if (!isMounted) return;
      setAuthError(error?.message || "Nie udało się ustawić trwałej sesji.");
    });

    getRedirectResult(auth)
      .then(() => undefined)
      .catch((error) => {
        if (!isMounted) return;
        setAuthError(
          error?.message ||
            "Nie udało się dokończyć logowania po przekierowaniu.",
        );
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (!isMounted) return;
        setUser(nextUser || null);
        setIsLoading(false);
      },
      (error) => {
        if (!isMounted) return;
        setAuthError(
          error?.message || "Nie udało się odczytać sesji logowania.",
        );
        setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setAuthError("Firebase Auth nie jest jeszcze skonfigurowany.");
      return;
    }

    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocalHost =
      host === "localhost" || host === "127.0.0.1" || host === "::1";

    setAuthError("");
    try {
      if (isLocalHost) {
        await signInWithPopup(auth, googleProvider);
        return;
      }

      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setAuthError(error?.message || "Logowanie Google nie powiodło się.");
    }
  }, []);

  const signOutUser = useCallback(async () => {
    if (!auth) return;

    setAuthError("");
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(error?.message || "Wylogowanie nie powiodło się.");
    }
  }, []);

  return {
    user,
    authError,
    isLoading,
    isConfigured: isFirebaseConfigured,
    signInWithGoogle,
    signOutUser,
  };
}
