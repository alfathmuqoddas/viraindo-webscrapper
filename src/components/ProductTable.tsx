import { useState, useMemo } from "preact/hooks";
import { currencyFormatter } from "@/lib/helper";
import AddToBuilderButton from "@/components/builder/AddToBuilderButton";
import { typeToOmit } from "@/lib/constant.mjs";
import type { PartWithoutId } from "@/type";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-preact";

export const ProductTable = ({ products }: { products?: PartWithoutId[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    setCurrentPage(1);

    if (!query.trim()) return products;

    return products?.filter(
      (p) =>
        p.model?.toLowerCase().includes(query.toLowerCase()) ||
        p.brand?.toLowerCase().includes(query.toLowerCase()),
    );
  }, [products, query]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleProducts = filteredProducts
    .sort((a, b) => a.price - b.price)
    .slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
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
      {query.trim() && (
        <p className="">
          {filteredProducts.length} of {products?.length} product(s) found
        </p>
      )}
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
            {!visibleProducts || visibleProducts.length === 0 ? (
              <tr className="">
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              visibleProducts.map((p, index) => {
                return (
                  <tr key={index} className="">
                    <td className="p-3 align-middle truncate">
                      {index + startIndex + 1}
                    </td>
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

      {totalPages > 1 && (
        <nav className="flex justify-between gap-2 items-center">
          <button
            className="btn btn-ghost btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeftIcon size={20} />
          </button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="px-2 py-1 rounded border border-gray-200 bg-white max-w-16"
              value={currentPage}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                setCurrentPage(parseInt(target.value));
              }}
            />
            <span>/</span>
            <span>{totalPages}</span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            <ChevronRightIcon size={20} />
          </button>
        </nav>
      )}
    </div>
  );
};
