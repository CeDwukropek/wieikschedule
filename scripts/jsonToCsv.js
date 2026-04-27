// scripts/jsonToCsv.js - run with node
const fs = require("fs");
const path = require("path");

const timetablesDir = "./src/timetables";
const files = fs.readdirSync(timetablesDir).filter((f) => f.endsWith(".json"));

let allRows = [];

files.forEach((file) => {
  const faculty = file.replace(".json", "");
  const json = JSON.parse(fs.readFileSync(path.join(timetablesDir, file)));

  (json.events || []).forEach((event) => {
    allRows.push(
      [
        faculty,
        event.date,
        event.startTime,
        event.durationMin || 90,
        event.subject,
        event.instructor || "",
        event.room || "",
        event.group || "",
        event.type || "",
        event.status || "aktywne",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
  });
});

const header =
  "faculty,date,start_time,duration_min,subject,instructor,room,group,type,status";
fs.writeFileSync("./events.csv", header + "\n" + allRows.join("\n"));
console.log(`Exported ${allRows.length} events`);
