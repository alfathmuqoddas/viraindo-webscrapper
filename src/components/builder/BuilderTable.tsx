import { useStore } from "@nanostores/preact";
import { Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { partStore } from "@/store/partStore";
import { RemoveFromBuilderButton } from "./RemoveFromBuilderButton";
import { currencyFormatter } from "@/lib/helper";
import { pcPartsOnly, MULTI_SELECTION_TYPES } from "@/lib/constant.mjs";
import { navigate } from "astro:transitions/client";

export const BuilderTable = () => {
  const $parts = useStore(partStore);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const totalPrice = $parts.parts.reduce((acc, part) => acc + part.price, 0);

  const partsGroupedByType = Object.groupBy($parts.parts, (p) => p.type);

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
              const selectedParts = partsGroupedByType[source.type] || [];
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
                  <tr className="font-mono">
                    <td
                      className="p-3 font-semibold border-r capitalize align-middle truncate"
                      rowSpan={totalRows}
                    >
                      {source.name}
                    </td>

                    {hasParts ? (
                      <>
                        <td className="p-3 align-middle wrap-break-words">
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
                            className="text-blue-500 hover:underline active:underline underline-offset-2 cursor-pointer"
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
                      <tr key={part.id} className="font-mono border-t">
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
                    <tr className="font-mono border-t">
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
        <h1>Total Price: {currencyFormatter.format(totalPrice)}</h1>
      </div>
    </>
  );
};

export default BuilderTable;
