import data from "@/data.json";

export function getStaticPaths() {
  const pathsMap = new Map();

  data.forEach((item) => {
    const type = item.type.toLowerCase();
    const brand = item.brand.toLowerCase();

    if (!brand || brand.trim() === "") return;

    const key = `${type}/${brand}`;

    if (!pathsMap.has(key)) {
      pathsMap.set(key, {
        params: { type, brand },
        props: {
          products: data.filter(
            (i) =>
              i.type.toLowerCase() === type && i.brand.toLowerCase() === brand,
          ),
        },
      });
    }
  });

  return Array.from(pathsMap.values());
}

export async function GET({ props }) {
  return new Response(JSON.stringify(props.products), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
