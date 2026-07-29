import { addPart } from "@/store/partStore";
import type { PartWithoutId } from "@/type";
import { navigate } from "astro:transitions/client";
import { typeToOmit } from "@/lib/constant.mjs";

export const AddToBuilderButton = ({ part }: { part: PartWithoutId }) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (typeToOmit.includes(part.type)) {
      alert("This component cannot be added to the builder");
      return;
    }
    //this will add part and redirect to /builder
    addPart({ ...part, id: Date.now().toString() });
    if (typeof window !== "undefined") {
      navigate("/builder");
    }
  };
  return (
    <button
      className="btn btn-sm btn-primary"
      onClick={handleClick}
      aria-label="Add to builder"
      title="Add to builder"
    >
      Add
    </button>
  );
};

export default AddToBuilderButton;
