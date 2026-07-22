import { persistentAtom } from "@nanostores/persistent";
import type { Part } from "@/type";
import { MULTI_SELECTION_TYPES } from "@/lib/constant.mjs";

export const partStore = persistentAtom<Part[]>("selected_parts", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const addPart = (newPart: Part) => {
  const currentParts = partStore.get();

  const allowsMultiple = MULTI_SELECTION_TYPES.includes(
    newPart.type.toLowerCase(),
  );

  if (allowsMultiple) {
    partStore.set([...currentParts, newPart]);
  } else {
    const filteredParts = currentParts.filter(
      (p) => p.type.toLowerCase() !== newPart.type.toLowerCase(),
    );
    partStore.set([...filteredParts, newPart]);
  }
};

export const removePart = (id: string) => {
  partStore.set(partStore.get().filter((p) => p.id !== id));
};

export const resetParts = () => {
  partStore.set([]);
};
