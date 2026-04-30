// scripts/scrape.ts
import { getAllData } from "./scrapper.mjs";
import { writeFileSync } from "fs";

const data = await getAllData();

writeFileSync("./src/data.json", JSON.stringify(data, null, 2));

console.log("✅ Data scraped and saved");
