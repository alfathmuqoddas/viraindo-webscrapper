import * as cheerio from "cheerio";
import { writeFileSync } from "fs";

async function scrapeTable(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const rows = $("table tbody tr");
    const numRows = rows.length;
    if (numRows === 0) return [];

    // Safely detect max columns across the rows
    let numCols = 0;
    rows.each((_, row) => {
      const cellCount = $(row).find("td").length;
      if (cellCount > numCols) numCols = cellCount;
    });

    const numPairs = Math.floor(numCols / 2);

    // Pre-allocate the fixed-size array based on your horizontal-to-vertical mathematical logic
    const result = new Array(numRows * numPairs);

    rows.each((rowIndex, row) => {
      const cells = $(row).find("td");

      for (let pairIndex = 0; pairIndex < numPairs; pairIndex++) {
        const descTd = $(cells[pairIndex * 2]);
        const priceTd = $(cells[pairIndex * 2 + 1]);

        if (!descTd.length) continue;

        // Clean &nbsp; and extra whitespace spaces
        const description = descTd
          .text()
          .replace(/\u00a0/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const price = priceTd.length
          ? priceTd
              .text()
              .replace(/\u00a0/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          : "";

        // Clean-up filter rules for completely empty records or non-priced text
        if (
          !price ||
          price === "" ||
          price.toLowerCase() === "call" ||
          !description
        ) {
          continue;
        }
        if (description.startsWith("Telp.") || description.startsWith("Fax")) {
          continue;
        }

        // Mathematical index slot mapping calculation matching your specification
        const newRowIndex = rowIndex + pairIndex * numRows;

        // Assign explicitly to the exact calculated index position (storing just model and price)
        result[newRowIndex] = {
          model: description,
          price: price,
        };
      }
    });

    // Strip out all undefined array slots caused by blank rows
    return result.filter((item) => item !== undefined);
  } catch (err) {
    console.error(`Error fetching or parsing ${url}:`, err.message);
    return [];
  }
}

const urlToFetch = [
  { productName: "processor", url: "https://www.viraindo.com/proc.html" },
  {
    productName: "motherboard",
    url: "https://www.viraindo.com/motherboard.html",
  },
  { productName: "storage", url: "https://www.viraindo.com/storage.html" },
  { productName: "RAM", url: "https://www.viraindo.com/memory.html" },
  { productName: "GPU", url: "https://www.viraindo.com/vga.html" },
  { productName: "psu", url: "https://www.viraindo.com/psu.html" },
  { productName: "display", url: "https://www.viraindo.com/lcd.html" },
  { productName: "case", url: "https://www.viraindo.com/casing.html" },
];

for (const url of urlToFetch) {
  const data = await scrapeTable(url.url);
  writeFileSync(
    `./${url.productName}-data.json`,
    JSON.stringify(data, null, 2),
  );
}

console.log(
  "✅ Data successfully sorted mathematically and saved (without brand context).",
);
