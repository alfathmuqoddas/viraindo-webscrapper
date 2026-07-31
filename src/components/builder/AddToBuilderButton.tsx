import { addPart } from "@/store/partStore";
import type { PartWithoutId } from "@/type";
import { navigate } from "astro:transitions/client";
import { typeToOmit } from "@/lib/constant.mjs";
import { useStore } from "@nanostores/preact";
import { partStore } from "@/store/partStore";

export const AddToBuilderButton = ({ part }: { part: PartWithoutId }) => {
  const $parts = useStore(partStore);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (typeToOmit.includes(part.type)) {
      alert("This component cannot be added to the builder");
      return;
    }
    //this will add part and redirect to /builder
    addPart({ ...part, id: Date.now().toString() });

    if (typeof window !== "undefined") {
      if ($parts.buildId) {
        navigate(`/builder/edit?buildId=${$parts.buildId}`);
      } else {
        navigate("/builder/add");
      }
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
