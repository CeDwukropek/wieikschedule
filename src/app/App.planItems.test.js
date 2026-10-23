import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";
import { getWeekStart, toIsoDate } from "../utils/date";

const monday = getWeekStart(new Date());
const day = offset => toIsoDate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset));
const lab = { id: 1, event_id: "lab-a", day: 0, start: "07:30", end: "09:00", title: "Modelowanie", subj: "MUD",
  type: "Laboratorium", room: "A-101", groups: ["Lk1"], dates: [day(0)] };
// No rawRows: the table is used as it is instead of being rebuilt with private changes.
const table = { schedule: [lab], minDate: day(-30), maxDate: day(60), subjects: {} };

jest.mock("../features/schedule/hooks/useScheduleManager", () => ({
  useScheduleManager: () => new Proxy({
    loadedTimetables: { EiAs3: mockTable() }, currentSchedule: "EiAs3", currentTimetable: mockTable(),
    studentGroups: { L: "Lk1" }, activeExternalSelections: [], subjects: {}, groupConfigs: [], timetableOptions: [],
    groupSetOptions: [], scheduleGroupSets: {}, activeGroupSetBySchedule: {}, timetableOptionsMessage: "", timetableDataSourceLabel: "",
    activeGroupSetId: "", activeGroupSetName: "", isScheduleLoading: false, isScheduleRefreshing: false,
  }, { get: (target, key) => key in target ? target[key] : jest.fn() }),
}));
function mockTable() { return table; }
jest.mock("../features/auth/useFirebaseAuth", () => ({
  useFirebaseAuth: () => ({ user: null, isConfigured: true, isLoading: false }),
}));
jest.mock("../features/settings/useSettings", () => ({
  useSettings: () => ({ savedSettings: null }),
  usePersistSettings: () => {},
}));
jest.mock("../lib/supabaseClient", () => ({ isSupabaseConfigured: false, supabase: null }));
jest.mock("../lib/firebaseClient", () => ({ auth: null }));
jest.mock("react-markdown", () => ({ children }) => <div>{children}</div>);
jest.mock("remark-gfm", () => () => {});

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  HTMLElement.prototype.scrollTo = jest.fn();
  HTMLElement.prototype.scrollIntoView = jest.fn();
});
afterEach(() => { delete process.env.REACT_APP_PLAN_ITEMS; delete global.fetch; });

test("a guest sees the group's entries, a Saturday entry opens the weekend and details are one click away", async () => {
  process.env.REACT_APP_PLAN_ITEMS = "true";
  const saturday = { id: "e1", scope: "group", faculty: "EiAs3", subject: "Modelowanie", group: "Lk1", kind: "poprawa",
    timing: "slot", event_id: null, date: day(5), start_time: "09:00:00", duration_min: 90, due_time: null,
    title: "Poprawa kolokwium", details: "Sala 108", state: "active", revision: 1, my_state: null, can_edit: false };
  const otherGroup = { ...saturday, id: "e2", group: "Lk2", title: "Nie moja grupa" };
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, items: [saturday, otherGroup], roles: [] }) });
  render(<App />);
  expect(screen.getByLabelText("Plan od poniedziałku do piątku, od 7:00 do 22:00")).toBeInTheDocument();
  await waitFor(() => expect(screen.getByLabelText("Plan od poniedziałku do niedzieli, od 7:00 do 22:00")).toBeInTheDocument());
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/^\/api\/plan-items\/list\?faculties=EiAs3&from=\d{4}-\d{2}-\d{2}&to=\d{4}-\d{2}-\d{2}$/);
  expect(options.headers.Authorization).toBeUndefined();
  expect(screen.queryByText("Nie moja grupa")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /^Poprawa: Poprawa kolokwium, 09:00–10:30/ }));
  const dialog = screen.getByRole("dialog", { name: "Poprawa kolokwium" });
  expect(dialog).toHaveTextContent("Sala 108");
  expect(dialog).toHaveTextContent("Grupa Lk1");
  expect(within(dialog).queryByRole("button", { name: "Gotowe" })).not.toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij szczegóły terminu" }));
  fireEvent.click(screen.getByRole("button", { name: /Nadchodzące terminy/ }));
  expect(screen.getByRole("dialog", { name: "Nadchodzące terminy" })).toBeInTheDocument();
});

test("without the flag no entries are requested and the week stays at five days", () => {
  global.fetch = jest.fn();
  render(<App />);
  expect(global.fetch).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: /Nadchodzące terminy/ })).not.toBeInTheDocument();
  expect(screen.getByLabelText("Plan od poniedziałku do piątku, od 7:00 do 22:00")).toBeInTheDocument();
});
