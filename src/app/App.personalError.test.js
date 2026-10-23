import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("../features/auth/useFirebaseAuth", () => ({
  useFirebaseAuth: () => ({ user: { uid: "synthetic-user" }, isConfigured: true, isLoading: false }),
}));
jest.mock("../features/settings/useSettings", () => ({
  useSettings: () => ({ savedSettings: null }),
  usePersistSettings: () => {},
}));
jest.mock("../features/my-plan/usePersonalPlan", () => ({
  usePersonalPlan: () => ({ rows: [], items: [], proposals: [], ready: false,
    error: "Nie udalo sie zweryfikowac tozsamosci uzytkownika.", refresh: jest.fn(), apply: jest.fn(),
    confirmProposal: jest.fn(), rejectProposal: jest.fn() }),
}));
jest.mock("../lib/supabaseClient", () => ({ isSupabaseConfigured: false, supabase: null }));
jest.mock("../lib/firebaseClient", () => ({ auth: null }));
jest.mock("react-markdown", () => ({ children }) => <div>{children}</div>);
jest.mock("remark-gfm", () => () => {});

test("a failed private layer keeps the university plan visible and says why", () => {
  process.env.REACT_APP_PERSONAL_SCHEDULE = "true";
  HTMLElement.prototype.scrollTo = jest.fn();
  HTMLElement.prototype.scrollIntoView = jest.fn();
  render(<App />);
  expect(screen.getByRole("alert")).toHaveTextContent("widzisz plan uczelni bez nich");
  expect(screen.getByRole("button", { name: "Spróbuj ponownie" })).toBeInTheDocument();
  expect(screen.getByLabelText("Plan od poniedziałku do piątku, od 7:00 do 22:00")).toBeInTheDocument();
  delete process.env.REACT_APP_PERSONAL_SCHEDULE;
});
