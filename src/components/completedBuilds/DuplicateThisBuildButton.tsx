import { StickyNotes } from "lucide-preact";
import { type TBuild } from "@/type";
import { setParts } from "@/store/partStore";
import { navigate } from "astro:transitions/client";

export const DuplicateThisBuildButton = ({
  build,
}: {
  build: TBuild["parts"];
}) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();

    setParts(build);

    navigate("/builder");
  };

  return (
    <button onClick={handleClick} className="btn btn-sm btn-primary flex-1">
      <StickyNotes size={16} />
      <span>Duplicate</span>
    </button>
  );
};
