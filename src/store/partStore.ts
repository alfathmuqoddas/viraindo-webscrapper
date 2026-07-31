import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";
import type { Part } from "@/type";
import { MULTI_SELECTION_TYPES } from "@/lib/constant.mjs";

export const partStore = persistentAtom<{
  parts: Part[];
  title: string;
  buildId: string | null;
  description: string;
}>(
  "selected_parts",
  { title: "", description: "", buildId: null, parts: [] },
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

export const setParts = (parts: Part[]) => {
  partStore.set({ ...partStore.get(), parts });
};

export const resetParts = () => {
  partStore.set({ title: "", description: "", buildId: null, parts: [] });
};

export const setTitle = (title: string) => {
  partStore.set({ ...partStore.get(), title });
};

export const setDescription = (description: string) => {
  partStore.set({ ...partStore.get(), description });
};

export const setBuildId = (buildId: string | null) => {
  partStore.set({ ...partStore.get(), buildId });
};

export const $totalPrice = computed(partStore, ($s) =>
  ($s?.parts ?? []).reduce((acc, part) => acc + part.price, 0),
);

export const $partsGroupedByType = computed(partStore, ($s) =>
  Object.groupBy($s?.parts ?? [], (p) => p.type),
);

export const $editMode = computed(partStore, ($s) => !!$s?.buildId);
