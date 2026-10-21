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

  test("the plan tab is the default and the chosen tab is remembered", () => {
    const props = { panelState: panel, filterState: filters,
      scheduleState: { currentSchedule: "EiAs3", timetableOptions: [{ id: "EiAs3", name: "EiAs3" }] } };
    const { unmount } = render(<SettingsPanel {...props} />);
    expect(screen.getByRole("tab", { name: "Plan" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("combobox", { name: "Plan zajęć" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Asystent AI" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "AI i integracje" }));
    expect(screen.getByRole("heading", { name: "Asystent AI" })).toBeVisible();
    expect(screen.queryByRole("combobox", { name: "Plan zajęć" })).not.toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "AI i integracje" })).toBeVisible();
    unmount();
    render(<SettingsPanel {...props} />);
    expect(screen.getByRole("tab", { name: "AI i integracje" })).toHaveAttribute("aria-selected", "true");
  });

  test("without AI features there are no tabs", () => {
    process.env.REACT_APP_PERSONAL_SCHEDULE = "false";
    render(<SettingsPanel panelState={panel} filterState={filters} scheduleState={{ currentSchedule: "EiAs3", timetableOptions: [] }} />);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });
});
