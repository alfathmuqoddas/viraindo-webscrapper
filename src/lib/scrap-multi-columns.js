import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import { COMPONENT_BRANDS, SOURCES as urlToFetch } from "./constant.mjs";

export function cleanAndNormalizeData(rawItems, productType) {
  const dictionary = COMPONENT_BRANDS[productType] || [];
  const genericHeaders = [
    "CASING",
    "VGA CARD",
    "VGA",
    "MOTHERBOARD",
    "OTHERS",
    "UNKNOWN",
    "HARDDISK",
  ];

  return rawItems.map((item) => {
    let cleanBrand = item.brand ? item.brand.trim() : "UNKNOWN";
    let upperBrand = cleanBrand.toUpperCase();
    const upperModel = item.model.toUpperCase();

    // Condition A: If the header is missing, general, or generic, find the real brand inside the text
    if (
      !cleanBrand ||
      genericHeaders.some((g) => upperBrand.includes(g)) ||
      upperBrand === "UNKNOWN"
    ) {
      // Look for a known brand keyword inside the item string
      const matchedBrand = dictionary.find((brand) =>
        upperModel.includes(brand),
      );

      if (matchedBrand) {
        cleanBrand = matchedBrand;
      } else {
        // Fallback: If no dictionary brand matches, use the first word as a fallback
        cleanBrand = item.model.split(" ")[0].toUpperCase();
      }
    }

    // Condition B: Standardize common brand typos/variations to uniform casing
    if (cleanBrand.toUpperCase().startsWith("INTEL")) cleanBrand = "INTEL";
    if (cleanBrand.toUpperCase().startsWith("AMD")) cleanBrand = "AMD";
    if (cleanBrand.toUpperCase().includes("GIGABYTE")) cleanBrand = "GIGABYTE";

    return {
      type: productType,
      brand: cleanBrand,
      model: item.model,
      price: item.price,
    };
  });
}

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

const allDataCombined = [];

for (const source of urlToFetch) {
  const rawData = await scrapeTable(source.url);

  const perfectlyCleanData = cleanAndNormalizeData(rawData, source.type);

  // writeFileSync(
  //   `./${source.type}-data.json`,
  //   JSON.stringify(perfectlyCleanData, null, 2),
  // );

  console.log(`✅ Scraped ${source.type} data from ${source.url}`);

  allDataCombined.push(...perfectlyCleanData);
}

writeFileSync("./src/data.json", JSON.stringify(allDataCombined, null, 2));

console.log("✅ Data correctly mapped, filtered, and saved safely!");
