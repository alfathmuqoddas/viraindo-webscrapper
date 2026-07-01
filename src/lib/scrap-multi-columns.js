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
          //type: type of the item (notebook, processor, memory, etc.)
          //brand: brand name of the item (INTEL, AMD, Apple, Dell, MSI, Corsair, Cooler Master, Be Quiet!, etc.)
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

export const urlToFetch = [
  // { type: "processor", url: "https://www.viraindo.com/proc.html" },
  // {
  //   type: "motherboard",
  //   url: "https://www.viraindo.com/motherboard.html",
  // },
  // { type: "storage", url: "https://www.viraindo.com/storage.html" },
  // { type: "RAM", url: "https://www.viraindo.com/memory.html" },
  // { type: "GPU", url: "https://www.viraindo.com/vga.html" },
  // { type: "psu", url: "https://www.viraindo.com/psu.html" },
  // { type: "display", url: "https://www.viraindo.com/lcd.html" },
  // { type: "case", url: "https://www.viraindo.com/casing.html" },
  // {
  //   type: "pc-branded",
  //   url: "https://www.viraindo.com/pcbranded.html",
  //   icon: "🖥️",
  // },
  // { type: "gadget", url: "https://www.viraindo.com/gadget.html", icon: "📱" },
  {
    type: "notebook",
    url: "https://www.viraindo.com/notebook.html",
    icon: "💻",
  },
];

for (const source of urlToFetch) {
  const data = await scrapeTable(source.url);

  const finalData = data.map((item) => ({
    type: source.type,
    ...item,
  }));

  writeFileSync(
    `./${source.type}-data.json`,
    JSON.stringify(finalData, null, 2),
  );
}

console.log("✅ Data correctly mapped, filtered, and saved safely!");
