import { persistentAtom } from "@nanostores/persistent";
import type { Part } from "@/type";
import { MULTI_SELECTION_TYPES } from "@/lib/constant.mjs";

export const partStore = persistentAtom<{
  parts: Part[];
  title: string;
  description: string;
}>(
  "selected_parts",
  { title: "", description: "", parts: [] },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

export const addPart = (newPart: Part) => {
  const currentParts = partStore.get();

  const allowsMultiple = MULTI_SELECTION_TYPES.includes(
    newPart.type.toLowerCase(),
  );

  if (allowsMultiple) {
    partStore.set({ ...currentParts, parts: [...currentParts.parts, newPart] });
  } else {
    const filteredParts = currentParts.parts.filter(
      (p) => p.type.toLowerCase() !== newPart.type.toLowerCase(),
    );
    partStore.set({ ...currentParts, parts: [newPart, ...filteredParts] });
  }
};

export const removePart = (id: string) => {
  const currentParts = partStore.get();
  const filteredParts = currentParts.parts.filter(
    (p) => p.id.toLowerCase() !== id.toLowerCase(),
  );
  partStore.set({ ...currentParts, parts: filteredParts });
};

export const resetParts = () => {
  partStore.set({ title: "", description: "", parts: [] });
};

export const setTitle = (title: string) => {
  partStore.set({ ...partStore.get(), title });
};

export const setDescription = (description: string) => {
  partStore.set({ ...partStore.get(), description });
};
