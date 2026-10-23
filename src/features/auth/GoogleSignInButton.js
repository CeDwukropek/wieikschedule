import { LogOut } from "lucide-react";
import { useFirebaseAuth } from "./useFirebaseAuth";

function GoogleIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.96h5.51c-.24 1.28-.97 2.36-2.05 3.08l3.31 2.57c1.93-1.78 3.04-4.4 3.04-7.51 0-.72-.06-1.41-.18-2.07H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.75 0 5.06-.91 6.74-2.47l-3.31-2.57c-.92.62-2.09 1-3.43 1-2.64 0-4.87-1.78-5.67-4.18l-3.42 2.64C4.57 19.75 8.03 22 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.33 13.78c-.2-.62-.33-1.28-.33-1.98s.12-1.36.33-1.98L2.91 7.18C2.33 8.32 2 9.62 2 10.98s.33 2.66.91 3.8l3.42-1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.98c1.5 0 2.85.52 3.91 1.54l2.93-2.93C17.04 2.91 14.73 2 12 2 8.03 2 4.57 4.25 2.91 7.18l3.42 2.64c.8-2.4 3.03-4.18 5.67-4.18z"
      />
    </svg>
  );
}

export default function GoogleSignInButton() {
  const {
    user,
    authError,
    isConfigured: isAuthConfigured,
    isLoading: isAuthLoading,
    signInWithGoogle,
    signOutUser,
  } = useFirebaseAuth();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={user ? signOutUser : signInWithGoogle}
          disabled={!isAuthConfigured || isAuthLoading}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          title={user ? "Wyloguj z Google" : "Zaloguj przez Google"}
        >
          {user ? (
            <LogOut className="h-4 w-4" />
          ) : (
            <GoogleIcon className="h-4 w-4" />
          )}
          <span>{user ? "Wyloguj" : "Google"}</span>
        </button>
      </div>

      {!isAuthConfigured ? (
        <p className="text-right text-[11px] text-amber-300">
          Skonfiguruj REACT_APP_FIREBASE_* aby włączyć logowanie.
        </p>
      ) : null}

      {authError ? (
        <p className="text-right text-[11px] text-rose-300">
          {authError}
        </p>
      ) : null}
    </div>
  );
}
