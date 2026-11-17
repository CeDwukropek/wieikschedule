import { fireEvent, render, screen } from "@testing-library/react";
import BrowsePanel from "./BrowsePanel";

const directory = { teachers: [{ key: "dr inż. M. Pawlik", label: "dr inż. M. Pawlik" }, { key: "mgr J. Firganek", label: "mgr J. Firganek" }],
  rooms: [{ key: "A3", label: "A3" }], subjects: [{ key: "analiza", label: "Analiza", plans: ["EiAs3"] }, { key: "analiza matematyczna", label: "Analiza matematyczna", plans: ["IwIKs3"] }] };

test("an instructor is found by part of the name and opens their plan", () => {
  const onBrowse = jest.fn(), onClose = jest.fn(), onLayout = jest.fn();
  render(<BrowsePanel open isWeek onLayout={onLayout} browse={{ mode: "mine" }} onBrowse={onBrowse} directory={directory} onClose={onClose}/>);
  fireEvent.click(screen.getByRole("button", { name: "Dzień" }));
  expect(onLayout).toHaveBeenCalledWith("day");
  fireEvent.click(screen.getByRole("button", { name: "Prowadzący" }));
  const search = screen.getByRole("searchbox", { name: "Szukaj prowadzącego" });
  expect(search).toHaveFocus();
  fireEvent.change(search, { target: { value: "paw" } });
  fireEvent.click(screen.getByRole("button", { name: "dr inż. M. Pawlik" }));
  expect(onBrowse).toHaveBeenCalledWith({ mode: "teacher", key: "dr inż. M. Pawlik", label: "dr inż. M. Pawlik" });
  expect(onClose).toHaveBeenCalled();
});

test("Enter picks the first room; own plan and free rooms apply at once", () => {
  const onBrowse = jest.fn();
  render(<BrowsePanel open isWeek onLayout={() => {}} browse={{ mode: "teacher", key: "x", label: "dr X" }} onBrowse={onBrowse}
    directory={directory} onClose={() => {}}/>);
  expect(screen.getByRole("button", { name: /Prowadzący/ })).toHaveTextContent("dr X");
  fireEvent.click(screen.getByRole("button", { name: "Sala" }));
  fireEvent.change(screen.getByRole("searchbox", { name: "Szukaj sali" }), { target: { value: "a3" } });
  fireEvent.keyDown(screen.getByRole("searchbox", { name: "Szukaj sali" }), { key: "Enter" });
  expect(onBrowse).toHaveBeenLastCalledWith({ mode: "room", key: "A3", label: "A3" });
  fireEvent.click(screen.getByRole("button", { name: "Wolne sale" }));
  expect(onBrowse).toHaveBeenLastCalledWith({ mode: "free" });
});

test("a subject is searched in one's own plan unless all plans are ticked", () => {
  const onBrowse = jest.fn();
  render(<BrowsePanel open isWeek onLayout={() => {}} browse={{ mode: "mine" }} onBrowse={onBrowse} directory={directory} currentPlan="EiAs3" onClose={() => {}}/>);
  fireEvent.click(screen.getByRole("button", { name: "Przedmiot" }));
  const search = screen.getByRole("searchbox", { name: "Szukaj przedmiotu" });
  fireEvent.change(search, { target: { value: "anal" } });
  expect(screen.queryByRole("button", { name: "Analiza matematyczna" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Analiza" }));
  expect(onBrowse).toHaveBeenLastCalledWith({ mode: "subject", key: "analiza", label: "Analiza", plan: "EiAs3" });
  const all = screen.getByRole("checkbox", { name: "Szukaj we wszystkich planach" });
  expect(all).not.toBeChecked();
  fireEvent.click(all);
  fireEvent.click(screen.getByRole("button", { name: "Analiza matematyczna" }));
  expect(onBrowse).toHaveBeenLastCalledWith({ mode: "subject", key: "analiza matematyczna", label: "Analiza matematyczna", plan: null });
});
