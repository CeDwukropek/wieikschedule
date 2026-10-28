import { browseFromSearch, browseSearch, browseTimetable, buildDirectory, cleanRoom, freeRooms, isRoom, roomDay, searchDirectory } from "./browseLogic";

const row = (id, extra) => ({ id, faculty: "EiAs3", date: "2026-10-28", start_time: "09:15:00", duration_min: 90, subject: "Analiza",
  instructor: "dr inż. M. Pawlik", room: "A3", group: "L5", type: "laboratorium", status: "aktywne", ...extra });

test("one room has one spelling and only numbered places count as rooms", () => {
  expect(["H / C", "19_", " wa2 "].map(cleanRoom)).toEqual(["H/C", "19", "wa2"]);
  expect(["A3", "09 Działownia", "LZT b10-14"].every(isRoom)).toBe(true);
  expect(["BHP", "Szkolenie biblioteczne", "25-26_WIEiK_IwIK-1-s_SD"].some(isRoom)).toBe(false);
});

test("the directory splits instructors of one class and merges spellings of a room", () => {
  const directory = buildDirectory([
    row(1, { instructor: "dr inż. Z. Pilch, mgr inż. M. Gibas", room: "WA2" }), row(2, { room: "WA2" }), row(3, { room: "wa2" }),
  ]);
  expect(directory.teachers.map(entry => entry.key)).toEqual(["dr inż. M. Pawlik", "dr inż. Z. Pilch", "mgr inż. M. Gibas"]);
  expect(directory.rooms).toEqual([{ key: "WA2", label: "WA2", count: 3 }]);
  expect(searchDirectory(directory.teachers, "gibas")).toHaveLength(1);
  expect(searchDirectory(directory.teachers, "inz pil").map(entry => entry.key)).toEqual(["dr inż. Z. Pilch"]);
  expect(searchDirectory(directory.teachers, " ")).toEqual([]);
});

test("an instructor's plan spans plans and each class tells where it is and for whom", () => {
  const rows = [row(1), row(2, { faculty: "IwIKs3", group: "Lk2", room: "108D", start_time: "11:00:00" }),
    row(3, { instructor: "mgr J. Firganek" }), row(4, { instructor: "mgr J. Firganek, dr inż. M. Pawlik", start_time: "14:30:00", group: "W" })];
  const teacher = browseTimetable(rows, { mode: "teacher", key: "dr inż. M. Pawlik" }).schedule;
  expect(teacher.map(ev => [ev.start, ev.plan, ev.note])).toEqual([
    ["09:15", "EiAs3", "A3 · EiAs3 L5"], ["11:00", "IwIKs3", "108D · IwIKs3 Lk2"], ["14:30", "EiAs3", "A3 · EiAs3"]]);
  expect(teacher[0].day).toBe(2);
  const room = browseTimetable(rows, { mode: "room", key: "A3" }).schedule;
  expect(room.map(ev => ev.note)).toEqual(["EiAs3 L5", "EiAs3 L5", "EiAs3"]);
});

test("free rooms list windows, the state at a time and the next free window", () => {
  const rows = [row(1, { room: "A3", start_time: "09:15:00" }), row(2, { room: "A3", start_time: "11:00:00" }),
    row(3, { room: "A2", start_time: "08:00:00", duration_min: 60 }), row(4, { room: "A2", date: "2026-10-29" })];
  const rooms = [{ key: "A2", label: "A2" }, { key: "A3", label: "A3" }, { key: "A4", label: "A4" }, { key: "BHP", label: "BHP" }];
  const at10 = freeRooms(rows, rooms, "2026-10-28", 10 * 60);
  expect(at10.map(room => [room.label, room.now, room.busyUntil, room.next])).toEqual([
    ["A2", [540, 1320], null, null], ["A4", [420, 1320], null, null], ["A3", null, 645, [750, 1320]]]);
  // The 15-minute break 10:45–11:00 between classes is not a free window.
  expect(at10.find(room => room.label === "A3").windows).toEqual([[420, 555], [750, 1320]]);
});

test("a class held for several groups and plans at once is one class", () => {
  const rows = [row(1, { group: "L1" }), row(2, { group: "L2", type: "projekt" }), row(3, { faculty: "Erasmus", group: "" }), row(4, { room: "A4" })];
  const [shared, other] = browseTimetable(rows, { mode: "teacher", key: "dr inż. M. Pawlik" }).schedule;
  expect(shared.groups).toEqual(["L1", "L2"]);
  expect(shared.type).toBe("Laboratorium + Projekt");
  expect(shared.plan).toBe("EiAs3, Erasmus");
  expect(shared.note).toBe("A3 · EiAs3 L1, L2; Erasmus");
  expect(other.note).toBe("A4 · EiAs3 L5");
});

test("the browsed plan is kept in the address", () => {
  expect(browseFromSearch("?prowadzacy=dr%20in%C5%BC.%20M.%20Pawlik")).toEqual({ mode: "teacher", key: "dr inż. M. Pawlik", label: "dr inż. M. Pawlik" });
  expect(browseFromSearch("?sala=wa2")).toEqual({ mode: "room", key: "WA2", label: "wa2" });
  expect(browseFromSearch("?wolne")).toEqual({ mode: "free" });
  expect(browseFromSearch("?x=1")).toEqual({ mode: "mine" });
  expect(browseSearch("?x=1&sala=A3", { mode: "teacher", label: "mgr J. Firganek" })).toBe("?x=1&prowadzacy=mgr+J.+Firganek");
  expect(browseSearch("?sala=A3", { mode: "free" })).toBe("?wolne");
  expect(browseSearch("?wolne", { mode: "mine" })).toBe("");
});

test("a room's day lists its classes once each, under the catalog's key", () => {
  const rows = [row(1, { room: "H / C", group: "L1" }), row(2, { room: "H/C", group: "L2" }), row(3, { room: "A3", start_time: "07:30:00" }),
    row(4, { room: "A3", date: "2026-10-29" })];
  const day = roomDay(rows, "2026-10-28", key => (key === "H/C" ? "HALA C" : key));
  expect([...day.keys()]).toEqual(["HALA C", "A3"]);
  expect(day.get("HALA C")).toEqual([{ start: 555, end: 645, subject: "Analiza", type: "laboratorium", teacher: "dr inż. M. Pawlik", audience: "EiAs3 L1, L2" }]);
});
