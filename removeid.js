import fs from "fs";

const data = JSON.parse(
  fs.readFileSync("faculty_clean.json", "utf-8")
);

const cleaned = data.map(({ id, ...rest }) => rest);

fs.writeFileSync(
  "faculty_clean1.json",
  JSON.stringify(cleaned, null, 2)
);

console.log("✅ id removed from all entries");
