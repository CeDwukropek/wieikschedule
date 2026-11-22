import { fireEvent, render, screen, within } from "@testing-library/react";
import SettingsPanel from "./SettingsPanel";

jest.mock("../auth/GoogleSignInButton", () => () => null);
jest.mock("./AiSettings", () => () => <h3>Asystent AI</h3>);

const panel = { isOpen: true, onToggle: jest.fn() };
const filters = { groupConfigs: [], studentGroups: {} };

test("both dropdowns hide all while retaining real schedules and the original data", () => {
  const options = ["AwP4.0s2", "EE1s1", "EE2s2", "EiAs1", "EiAs3", "all", " ALL "]
    .map(id => ({ id, name: id }));
  render(<SettingsPanel panelState={panel} filterState={filters}
    scheduleState={{ currentSchedule: "AwP4.0s2", timetableOptions: options }}
    groupSetState={{ externalSelections: [{ id: "new", scheduleId: "" }] }} />);
  // The plan selector and the extra-group plan selector are the ones listing plans.
  const selects = screen.getAllByRole("combobox").filter(select => within(select).queryAllByRole("option").length);
  expect(within(selects[0]).getAllByRole("option").map(option => option.value))
    .toEqual(["AwP4.0s2", "EE1s1", "EE2s2", "EiAs1", "EiAs3"]);
  expect(within(selects[1]).getAllByRole("option").map(option => option.value))
    .toEqual(["", "EE1s1", "EE2s2", "EiAs1", "EiAs3"]);
  expect(options).toHaveLength(7);
});

test("the saved-plan fallback cannot reintroduce all when the catalog is empty", () => {
  render(<SettingsPanel panelState={panel} filterState={filters}
    scheduleState={{ currentSchedule: "all", timetableOptions: [] }} />);
  expect(screen.getAllByRole("option").some(option => option.value === "all")).toBe(false);
});

describe("AI and integrations live in their own tab", () => {
  const flags = { personal: process.env.REACT_APP_PERSONAL_SCHEDULE };
  beforeEach(() => { process.env.REACT_APP_PERSONAL_SCHEDULE = "true"; localStorage.clear(); });
  afterEach(() => { process.env.REACT_APP_PERSONAL_SCHEDULE = flags.personal; });

  test("the plan tab opens every time, also after the integrations tab was used", () => {
    const props = { panelState: panel, filterState: filters,
      scheduleState: { currentSchedule: "EiAs3", timetableOptions: [{ id: "EiAs3", name: "EiAs3" }] } };
    const { unmount } = render(<SettingsPanel {...props} />);
    expect(screen.getByRole("tab", { name: "Plan" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("combobox", { name: "Plan zajęć" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Asystent AI" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Integracje" }));
    expect(screen.getByRole("heading", { name: "Asystent AI" })).toBeVisible();
    expect(screen.queryByRole("combobox", { name: "Plan zajęć" })).not.toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Integracje" })).toBeVisible();
    unmount();
    render(<SettingsPanel {...props} />);
    expect(screen.getByRole("tab", { name: "Plan" })).toHaveAttribute("aria-selected", "true");
  });

  test("\"Mój plan\" opens from the plan tab with the number of changes", () => {
    const onOpen = jest.fn();
    render(<SettingsPanel panelState={panel} filterState={filters} viewState={{ myPlan: { count: 3, proposals: 1, onOpen } }}
      scheduleState={{ currentSchedule: "EiAs3", timetableOptions: [] }} />);
    const button = screen.getByRole("button", { name: /Moje zmiany w planie/ });
    expect(button).toHaveTextContent("3");
    expect(button).toHaveTextContent("1 do zatwierdzenia");
    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalled();
  });

  test("without AI features there are no tabs", () => {
    process.env.REACT_APP_PERSONAL_SCHEDULE = "false";
    render(<SettingsPanel panelState={panel} filterState={filters} scheduleState={{ currentSchedule: "EiAs3", timetableOptions: [] }} />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });
});
