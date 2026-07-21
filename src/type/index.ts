export type Part = {
  id: string;
  model: string;
  price: number;
  brand: string;
  type: string;
};

export type PartWithoutId = Omit<Part, "id">;
