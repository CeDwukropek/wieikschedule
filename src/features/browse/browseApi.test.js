import { supabase } from "../../lib/supabaseClient";
import { loadDirectory } from "./browseApi";

jest.mock("../../lib/supabaseClient", () => ({ supabase: { from: jest.fn() } }));

test("the directory knows which plans each subject is taught in", async () => {
  localStorage.clear();
  const rows = [
    { faculty: "EiAs3", instructor: "dr inż. M. Pawlik", room: "A3", subject: "Analiza" },
    { faculty: "IwIKs3", instructor: "mgr J. Firganek", room: "108D", subject: "Analiza" },
  ];
  const query = { select: jest.fn(() => query), or: jest.fn(() => query), order: jest.fn(() => query),
    range: jest.fn(() => Promise.resolve({ data: rows, error: null })) };
  supabase.from.mockReturnValue(query);
  const directory = await loadDirectory();
  expect(query.select.mock.calls[0][0].split(",")).toContain("faculty");
  expect(directory.subjects).toEqual([{ key: "analiza", label: "Analiza", count: 2, plans: ["EiAs3", "IwIKs3"] }]);
});
