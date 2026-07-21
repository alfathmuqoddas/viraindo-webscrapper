import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import { SOURCES, COMPONENT_BRANDS } from "./constant.mjs";

/**
 * Removes all punctuation and extra spaces, then uppercases.
 * "be quiet!"  →  "BE QUIET"
 * "Cooler Master"  →  "COOLER MASTER"
 */
function normaliseText(text) {
  return text
    .replace(/[^a-z0-9\s]/gi, "") // delete everything except letters, digits and spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .toUpperCase();
}

/**
 * Cleans a scraped description cell:
 *  - replaces non‑breaking spaces with ordinary spaces
 *  - squeezes multiple spaces
 *  - removes leading/trailing whitespace
 */
function cleanCellText(rawText) {
  return rawText
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// convert from cleanCellText to number
function cleanCellTextToNumber(cleanCellText) {
  return Number(cleanCellText.replace(/\./g, ""));
}

/**
 * Tries to find a known brand name inside a product description.
 * Returns the original‑casing brand from the dictionary, or "UNKNOWN".
 */
function guessBrand(description, dictionary) {
  if (!dictionary || dictionary.length === 0) return "OTHER";

  const normalisedDesc = normaliseText(description);

  // Find the first dictionary entry whose normalised form appears in the description
  const found = dictionary.find((brand) =>
    normalisedDesc.includes(normaliseText(brand)),
  );

  return found ? found : "OTHER"; // keep the dictionary's own casing (e.g. "Cooler Master")
}

// ----------------------------------------------------------------------
// 3.  Scraping a single page (horizontal table → vertical product list)
// ----------------------------------------------------------------------

async function scrapePage(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const rows = $("table tbody tr");
  const rowCount = rows.length;
  if (rowCount === 0) return [];

  // Determine the maximum number of <td> cells in any row
  let maxCells = 0;
  rows.each((_, row) => {
    const count = $(row).find("td").length;
    if (count > maxCells) maxCells = count;
  });

  const pairsPerRow = Math.floor(maxCells / 2); // each item uses 2 cells (description + price)
  const totalItems = rowCount * pairsPerRow; // total slots we need
  const scrapedItems = new Array(totalItems); // pre‑allocate array for fixed indexing

  rows.each((rowIndex, row) => {
    const cells = $(row).find("td");

    for (let pair = 0; pair < pairsPerRow; pair++) {
      const descCell = $(cells[pair * 2]);
      const priceCell = $(cells[pair * 2 + 1]);

      // Skip if the description cell is missing
      if (!descCell.length) continue;

      const description = cleanCellText(descCell.text());
      const price = priceCell.length ? cleanCellText(priceCell.text()) : "";

      // Filters: ignore empty items, "call" prices, and contact lines
      if (!price || price === "" || price.toLowerCase() === "call") continue;
      if (!description) continue;
      if (description.startsWith("Telp.") || description.startsWith("Fax"))
        continue;

      // Map the logical position (row, pair) to a flat array index
      const targetIndex = rowIndex + pair * rowCount;
      scrapedItems[targetIndex] = {
        model: description,
        price: cleanCellTextToNumber(price),
      };
    }
  });

  // Remove empty slots (where a pair had no valid data)
  return scrapedItems
    .filter((item) => item !== undefined)
    .sort((a, b) => a.model.localeCompare(b.model));
}

// ----------------------------------------------------------------------
// 4.  Transforming raw items into clean, brand‑labelled data
// ----------------------------------------------------------------------

function enrichWithBrand(rawItems, productType) {
  // Look up the correct dictionary for this product type
  const brandDictionary = COMPONENT_BRANDS[productType.toLowerCase()] || [];

  return rawItems.map((item) => {
    // Guess the brand by searching the dictionary inside the description
    let brand = guessBrand(item.model, brandDictionary);

    return {
      type: productType,
      brand: brand,
      model: item.model,
      price: item.price,
    };
  });
}

// ----------------------------------------------------------------------
// 5.  Main orchestration
// ----------------------------------------------------------------------

async function main() {
  const allProducts = [];

  for (const source of SOURCES) {
    console.log(`🔍 Scraping ${source.type} from ${source.url} …`);

    const rawItems = await scrapePage(source.url);

    const cleanItems = enrichWithBrand(rawItems, source.type);

    console.log(`   ✅ Found ${cleanItems.length} items`);

    allProducts.push(...cleanItems);
  }

  // Save everything to one JSON file
  writeFileSync("./src/data.json", JSON.stringify(allProducts, null, 2));

  console.log(`\n🎉 Done! Total products saved: ${allProducts.length}`);
}

main().catch((err) => console.error("Fatal error:", err));
