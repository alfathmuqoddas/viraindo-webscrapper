import { useStore } from "@nanostores/preact";
import { Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { RemoveFromBuilderButton } from "./RemoveFromBuilderButton";
import { currencyFormatter } from "@/lib/helper";
import { pcPartsOnly, MULTI_SELECTION_TYPES } from "@/lib/constant.mjs";
import { navigate } from "astro:transitions/client";
import { $totalPrice, $partsGroupedByType } from "@/store/partStore";

export const BuilderTable = () => {
  const totalPrice = useStore($totalPrice);
  const partsGroupedByType = useStore($partsGroupedByType);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <div className="overflow-x-auto border border-gray-300 rounded-xl w-full text-sm">
        <table className="w-full min-w-xl bg-white">
          <thead>
            <tr className="bg-black text-white text-left uppercase tracking-wider text-xs">
              <th className="p-3 w-1/6 font-bold">Component</th>
              <th className="p-3 w-1/2 font-bold">Model</th>
              <th className="p-3 w-1/4 font-bold text-right">Price</th>
              <th className="p-3 w-16 text-center font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {pcPartsOnly.map((source: Record<string, string>) => {
              const selectedParts = partsGroupedByType?.[source.type] ?? [];
              const hasParts = selectedParts.length > 0;

              const allowMultiple = MULTI_SELECTION_TYPES.includes(
                source.type.toLowerCase(),
              );
              const showAddAnother = hasParts && allowMultiple;

              const totalRows = hasParts
                ? selectedParts.length + (showAddAnother ? 1 : 0)
                : 1;

              return (
                <Fragment key={source.type}>
                  <tr className="">
                    <td
                      className="p-3 font-medium border-gray-300 border-r uppercase tracking-wider align-middle truncate"
                      rowSpan={totalRows}
                    >
                      {source.name}
                    </td>

                    {hasParts ? (
                      <>
                        <td className="p-3 align-middle tracking-wide wrap-break-words">
                          {selectedParts[0].model}
                        </td>
                        <td className="p-3 align-middle text-right whitespace-nowrap">
                          {currencyFormatter.format(
                            selectedParts[0].price as number,
                          )}
                        </td>
                        <td className="p-3 align-middle text-center">
                          <RemoveFromBuilderButton id={selectedParts[0].id} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 align-middle wrap-break-words">
                          <button
                            className="text-blue-500 tracking-wide hover:underline active:underline underline-offset-2 cursor-pointer"
                            onClick={() => navigate(`/products/${source.type}`)}
                          >
                            + Choose {source.name}
                          </button>
                        </td>
                        <td className="p-3 align-middle text-right">-</td>
                        <td className="p-3 align-middle text-center">-</td>
                      </>
                    )}
                  </tr>

                  {hasParts &&
                    selectedParts.slice(1).map((part) => (
                      <tr key={part.id} className="border-t border-gray-300">
                        <td className="p-3 align-middle wrap-break-words">
                          {part.model}
                        </td>
                        <td className="p-3 align-middle text-right whitespace-nowrap">
                          {currencyFormatter.format(part.price as number)}
                        </td>
                        <td className="p-3 align-middle text-center">
                          <RemoveFromBuilderButton id={part.id} />
                        </td>
                      </tr>
                    ))}

                  {showAddAnother && (
                    <tr className="border-t border-gray-300">
                      <td className="p-3 align-middle wrap-break-words">
                        <button
                          className="text-blue-500 hover:underline active:underline underline-offset-2 cursor-pointer"
                          onClick={() => navigate(`/products/${source.type}`)}
                        >
                          + Add another {source.name}
                        </button>
                      </td>
                      <td className="p-3 align-middle text-right">-</td>
                      <td className="p-3 align-middle text-center">-</td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="my-4">
        <h1>Total Price: {currencyFormatter.format(totalPrice ?? 0)}</h1>
      </div>
    </>
  );
};

export default BuilderTable;
