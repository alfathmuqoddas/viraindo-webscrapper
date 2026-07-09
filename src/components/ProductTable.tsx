import { useState, useEffect } from "preact/hooks";

export const ProductTable = ({
  products,
}: {
  products: { type: string; brand: string; model: string; price: string }[];
}) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    setFilteredProducts(
      products.filter((p) =>
        p.model.toLowerCase().includes(debouncedQuery.toLowerCase()),
      ),
    );
  }, [debouncedQuery, products]);

  return (
    <>
      <div className="my-4">
        <div className="flex items-center justify-between w-full md:w-64 border">
          <input
            type="text"
            value={query}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              setQuery(target.value);
            }}
            className="w-full px-2 py-1 "
            placeholder="Search..."
          />
          <span className="px-1">🔎</span>
        </div>
      </div>
      <div className="overflow-x-auto w-full border">
        <table className="w-full min-w-xl bg-white">
          <thead>
            <tr className="tracking-tight border-b bg-black text-white">
              <th className="p-2">No</th>
              <th>Model</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr className="border-b">
                <td colSpan={3} className="p-2">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, index) => {
                const isLast = products.indexOf(p) === products.length - 1;
                return (
                  <tr className={`${!isLast ? "border-b" : ""} font-mono`}>
                    <td className="p-2 max-w-sm flex items-center justify-center">
                      {index + 1}
                    </td>
                    <td className="p-2 max-w-md">{p.model}</td>
                    <td className="p-2 ">Rp. {p.price}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
