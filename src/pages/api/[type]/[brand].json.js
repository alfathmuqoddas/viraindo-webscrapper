import data from "@/data.json";
import { slugify } from "@/lib/helper";

export const prerender = true;

export function getStaticPaths() {
  const brandPathsMap = new Map();
  const allPathsMap = new Map();

  for (const item of data) {
    const type = item.type.toLowerCase();
    if (!allPathsMap.has(type)) {
      allPathsMap.set(type, {
        params: { type, brand: "all" },
        props: {
          products: [],
        },
      });
    }
    allPathsMap.get(type).props.products.push(item);

    if (!item.brand) return;
    const brandSlug = slugify(item.brand);
    if (!brandSlug) return;
    const key = `${type}/${brandSlug}`;

    if (!brandPathsMap.has(key)) {
      brandPathsMap.set(key, {
        params: { type, brand: brandSlug },
        props: {
          products: [],
        },
      });
    }

    brandPathsMap.get(key).props.products.push(item);
  }

  return [
    ...Array.from(allPathsMap.values()),
    ...Array.from(brandPathsMap.values()),
  ];
}

export async function GET({ props }) {
  return new Response(JSON.stringify(props.products), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
