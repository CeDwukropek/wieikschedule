import { render, screen, within } from "@testing-library/react";
import SettingsPanel from "./SettingsPanel";

jest.mock("../auth/GoogleSignInButton", () => () => null);

const panel = { isOpen: true, onToggle: jest.fn() };
const filters = { groupConfigs: [], studentGroups: {} };

test("both dropdowns hide all while retaining real schedules and the original data", () => {
  const options = ["AwP4.0s2", "EE1s1", "EE2s2", "EiAs1", "EiAs3", "all", " ALL "]
    .map(id => ({ id, name: id }));
  render(<SettingsPanel panelState={panel} filterState={filters}
    scheduleState={{ currentSchedule: "AwP4.0s2", timetableOptions: options }}
    groupSetState={{ externalSelections: [{ id: "new", scheduleId: "" }] }} />);
  const selects = screen.getAllByRole("combobox");
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
