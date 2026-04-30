import * as cheerio from "cheerio";

export const SOURCES = [
  {
    type: "notebook",
    url: "https://www.viraindo.com/notebook.html",
    icon: "💻",
  },
  {
    type: "pc-branded",
    url: "https://www.viraindo.com/pcbranded.html",
    icon: "🖥️",
  },
  { type: "gadget", url: "https://www.viraindo.com/gadget.html", icon: "📱" },
];

export async function getAllData() {
  const allResults = [];

  for (const source of SOURCES) {
    const response = await fetch(source.url);
    const html = await response.text();
    const $ = cheerio.load(html);

    $("table tbody tr")
      .slice(3)
      .each((_, el) => {
        const tds = $(el).find("td");
        if (tds.length >= 2) {
          const fullDescription = $(tds[0]).text().trim();
          const price = $(tds[1]).text().trim();
          if (!price || price === "\u00A0") return;

          // Logic to determine brand - usually the first word
          const brand = fullDescription.split(" ")[0].toUpperCase();

          allResults.push({
            type: source.type,
            brand: brand,
            model: fullDescription,
            price: price,
          });
        }
      });
  }
  return allResults;
}
