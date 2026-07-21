import { X as Cross } from "lucide-preact";
import { removePart } from "@/store/partStore";

export const RemoveFromBuilderButton = ({ id }: { id: string | undefined }) => {
  const handleClick = () => {
    if (id) {
      removePart(id);
    }
  };

  return (
    <button
      class="text-gray-500 hover:text-red-500 active:text-red-500 px-2 py-1 cursor-pointer"
      onClick={handleClick}
    >
      <Cross size={20} />
    </button>
  );
};

export default RemoveFromBuilderButton;
