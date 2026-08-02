import { useState, useEffect } from "preact/hooks";
import { currencyFormatter } from "@/lib/helper";
import AddToBuilderButton from "@/components/builder/AddToBuilderButton";
import { typeToOmit } from "@/lib/constant.mjs";
import type { PartWithoutId } from "@/type";

export const ProductTable = ({ products }: { products?: PartWithoutId[] }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const list = products ?? [];
    setFilteredProducts(
      list.filter((p) =>
        p?.model?.toLowerCase().includes((debouncedQuery || "").toLowerCase()),
      ),
    );
  }, [debouncedQuery, products]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  return (
    <>
      <div className="my-4">
        <div className="flex items-center bg-white rounded-md  border-gray-300 justify-between w-full md:w-64 border">
          <input
            type="text"
            value={query}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              setQuery(target.value);
            }}
            className="w-full px-2 py-1"
            placeholder="Search..."
          />
          <span className="px-2">🔍</span>
        </div>
      </div>
      <div className="overflow-x-auto border border-gray-300 rounded-xl w-full">
        <table className="w-full min-w-xl bg-white">
          <thead>
            <tr className="bg-black text-white text-left uppercase tracking-wider text-xs">
              <th className="p-3 w-1/12 font-bold">No</th>
              <th className="p-3 w-7/12 font-bold">Model</th>
              <th className="p-3 w-3/12 font-bold text-right">Price</th>
              <th className="p-3 w-1/12 text-center font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {!filteredProducts || filteredProducts.length === 0 ? (
              <tr className="">
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, index) => {
                return (
                  <tr key={index} className="">
                    <td className="p-3 align-middle truncate">{index + 1}</td>
                    <td className="p-3 align-middle wrap-break-word">
                      <a
                        href={`https://google.com/search?q=${p.model}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Search on Google"
                        class="text-blue-500 hover:underline active:underline tracking-wide underline-offset-2"
                      >
                        {p.model}
                      </a>
                      <span className="px-1 text-xs">🔍</span>
                    </td>
                    <td className="p-3 align-middle text-right whitespace-nowrap">
                      {currencyFormatter.format(p.price)}
                    </td>
                    <td className="p-3 align-middle text-center">
                      {!typeToOmit.includes(p.type) ? (
                        <AddToBuilderButton part={p} />
                      ) : (
                        "-"
                      )}
                    </td>
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
