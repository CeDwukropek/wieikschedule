import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("../features/auth/useFirebaseAuth", () => ({
  useFirebaseAuth: () => ({ user: null, isConfigured: false, isLoading: false }),
}));
jest.mock("../features/settings/useSettings", () => ({
  useSettings: () => ({ savedSettings: null }),
  usePersistSettings: () => {},
}));
jest.mock("../lib/supabaseClient", () => ({ isSupabaseConfigured: false, supabase: null }));
jest.mock("../lib/firebaseClient", () => ({ auth: null }));
jest.mock("react-markdown", () => ({ children }) => <div>{children}</div>);
jest.mock("remark-gfm", () => () => {});

test("the app connects floating navigation to day view, settings and AI", async () => {
  HTMLElement.prototype.scrollTo = jest.fn();
  HTMLElement.prototype.scrollIntoView = jest.fn();
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /^Co oglądasz: Mój plan, tydzień/ }));
  fireEvent.click(screen.getByRole("button", { name: "Dzień" }));
  expect(screen.getByRole("button", { name: "Wróć do dzisiaj" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /^Co oglądasz: Mój plan, dzień/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Otwórz menu" }));
  expect(screen.getByRole("dialog", { name: "Menu i ustawienia" })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Otwórz AI chat" }));
  expect(await screen.findByRole("textbox", { name: "Wiadomość do AI" })).toHaveFocus();
});

test("free rooms replace the grid and the way back is always shown", () => {
  HTMLElement.prototype.scrollTo = jest.fn();
  HTMLElement.prototype.scrollIntoView = jest.fn();
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /^Co oglądasz/ }));
  fireEvent.click(screen.getByRole("button", { name: "Wolne sale" }));
  expect(screen.getByRole("region", { name: "Wolne sale" })).toBeInTheDocument();
  expect(window.location.search).toBe("?wolne");
  fireEvent.click(screen.getByRole("button", { name: "Wróć do mojego planu" }));
  expect(screen.queryByRole("region", { name: "Wolne sale" })).not.toBeInTheDocument();
  expect(window.location.search).toBe("");
});
