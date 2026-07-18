import data from "@/data.json";

export function getStaticPaths() {
  return data.map((item) => {
    const type = item.type.toLowerCase();
    const brand = item.brand.toLowerCase();

    // Filter data for this exact type + brand combination
    const filteredData = data.filter(
      (i) => i.type.toLowerCase() === type && i.brand.toLowerCase() === brand,
    );

    return {
      params: { type, brand },
      props: { filteredData },
    };
  });
}

export async function GET({ props }) {
  return new Response(JSON.stringify(props.filteredData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
