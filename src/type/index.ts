import type { Timestamp } from "firebase/firestore";

export type Part = {
  id: string;
  model: string;
  price: number;
  brand: string;
  type: string;
};

export type TBuild = {
  parts: Part[];
  title: string;
  description: string;
  isPublished: boolean;
  userName: string;
  userEmail: string;
  userPhotoUrl: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PartWithoutId = Omit<Part, "id">;
