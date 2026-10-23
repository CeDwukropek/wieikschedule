const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});
afterEach(() => { process.env = originalEnv; });

test("staging Supabase client uses the current origin even with production config present", () => {
  process.env.REACT_APP_LOCAL_STAGING = "true";
  process.env.REACT_APP_SUPABASE_URL = "https://production.example.invalid";
  process.env.REACT_APP_SUPABASE_ANON_KEY = "local-anon";
  const createClient = jest.fn(() => ({}));
  jest.doMock("@supabase/supabase-js", () => ({ createClient }));
  require("./supabaseClient");
  expect(createClient).toHaveBeenCalledWith(`${window.location.origin}/supabase`, "local-anon");
});

test.each(["true", "false"])("Firebase cloud settings isolation for staging=%s", (staging) => {
  process.env.REACT_APP_LOCAL_STAGING = staging;
  process.env.REACT_APP_FIREBASE_API_KEY = "synthetic-key";
  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = "synthetic.invalid";
  process.env.REACT_APP_FIREBASE_PROJECT_ID = "synthetic-project";
  process.env.REACT_APP_FIREBASE_APP_ID = "synthetic-app";
  const getFirestore = jest.fn(() => ({ cloud: true }));
  const getAuth = jest.fn(() => ({ auth: true }));
  jest.doMock("firebase/app", () => ({ getApps: () => [], initializeApp: () => ({}) }));
  jest.doMock("firebase/firestore", () => ({ getFirestore }));
  jest.doMock("firebase/auth", () => ({ getAuth,
    GoogleAuthProvider: jest.fn(() => ({ setCustomParameters: jest.fn() })) }));
  const client = require("./firebaseClient");
  expect(getAuth).toHaveBeenCalledTimes(1);
  expect(client.isFirebaseConfigured).toBe(true);
  if (staging === "true") {
    expect(client.db).toBeNull();
    expect(getFirestore).not.toHaveBeenCalled();
  } else expect(getFirestore).toHaveBeenCalledTimes(1);
});
