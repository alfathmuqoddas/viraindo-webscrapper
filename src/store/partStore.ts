import { persistentAtom } from "@nanostores/persistent";
import type { Part } from "@/type";

export const partStore = persistentAtom<Part[]>("selected_parts", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const addPart = (newPart: Part) => {
  partStore.set([...partStore.get(), newPart]);
};

export const removePart = (id: string) => {
  partStore.set(partStore.get().filter((p) => p.id !== id));
};

export const resetParts = () => {
  partStore.set([]);
};
