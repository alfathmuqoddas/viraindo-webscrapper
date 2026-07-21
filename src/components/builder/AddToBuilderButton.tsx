import { addPart } from "@/store/partStore";
import type { PartWithoutId } from "@/type";
import { navigate } from "astro:transitions/client";

export const AddToBuilderButton = ({ part }: { part: PartWithoutId }) => {
  const handleClick = () => {
    //this will add part and redirect to /builder
    addPart({ ...part, id: Date.now().toString() });
    if (typeof window !== "undefined") {
      navigate("/builder");
    }
  };
  return (
    <button
      class="ml-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-600 text-white text-sm font-medium px-2 py-1 cursor-pointer rounded-md"
      onClick={handleClick}
    >
      Add
    </button>
  );
};
4;

export default AddToBuilderButton;
