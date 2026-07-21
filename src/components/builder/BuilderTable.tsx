import { useStore } from "@nanostores/preact";
import { useState, useEffect } from "preact/hooks";
import { partStore } from "@/store/partStore";
import { RemoveFromBuilderButton } from "./RemoveFromBuilderButton";
import { currencyFormatter } from "@/lib/helper";
import { pcPartsOnly } from "@/lib/constant.mjs";
import { navigate } from "astro:transitions/client";

export const BuilderTable = () => {
  const $parts = useStore(partStore);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const totalPrice = $parts.reduce((acc, part) => acc + part.price, 0);

  const partsGroupedByType = Object.groupBy($parts, (p) => p.type);

  return (
    <>
      <div className="overflow-x-auto border w-full text-sm">
        <table className="w-full min-w-xl bg-white">
          <thead>
            <tr className="bg-black text-white text-left uppercase tracking-wider text-xs">
              <th className="p-3 w-1/6 font-bold">Component</th>
              <th className="p-3 w-1/2 font-bold">Model</th>
              <th className="p-3 w-1/4 font-bold text-right">Price</th>
              <th className="p-3 w-16 text-center font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {pcPartsOnly.map((source: Record<string, string>) => {
              const selectedPart = partsGroupedByType[source.type];

              return (
                <tr key={source.type} className="font-mono">
                  <td className="p-3 font-semibold capitalize align-middle truncate">
                    {source.name}
                  </td>
                  {selectedPart ? (
                    <>
                      <td className="p-3 align-middle wrap-break-word">
                        {selectedPart.at(-1)?.model}
                      </td>
                      <td className="p-3 align-middle text-right whitespace-nowrap">
                        {currencyFormatter.format(selectedPart.at(-1)?.price)}
                      </td>
                      <td className="p-3 align-middle text-center">
                        <RemoveFromBuilderButton id={selectedPart.at(-1)?.id} />
                      </td>
                    </>
                  ) : (
                    <td class="p-3 align-middle wrap-break-word">
                      <button
                        className="hover:underline active:text-blue-500 underline-offset-2 cursor-pointer"
                        onClick={() => navigate(`/products/${source.type}`)}
                      >
                        + Choose {source.name}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="my-4">
        <h1>Total Price: {currencyFormatter.format(totalPrice)}</h1>
      </div>
    </>
  );
};

export default BuilderTable;
