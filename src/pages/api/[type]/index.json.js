import data from "@/data.json";

export function getStaticPaths() {
  const uniqueTypes = [...new Set(data.map((p) => p.type.toLowerCase()))];

  return uniqueTypes.map((type) => ({
    params: { type },
  }));
}

export async function GET({ params }) {
  const { type } = params;

  const typeProducts = data.filter((p) => p.type.toLowerCase() === type);

  const uniqueBrands = [
    ...new Set(typeProducts.map((p) => p.brand.toLowerCase())),
  ];

  return new Response(JSON.stringify(uniqueBrands), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
