import { useState } from "preact/hooks";
import { useAuth } from "@/hooks/useAuth";
import { Trash2 as Trash } from "lucide-preact";
import { dbLite } from "@/firebase/client";
import { doc, deleteDoc } from "firebase/firestore/lite";

export const RemoveMyBuild = ({
  id,
  userId,
  onSuccess,
}: {
  id: string | undefined;
  userId: string | undefined;
  onSuccess?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { uid } = user ?? {};

  const handleClick = async (e: MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to remove this build?")) return;
    setIsLoading(true);
    if (!id || !uid) {
      alert("Please login to remove your build");
      return;
    }
    if (userId !== uid) {
      alert("You are not the owner of this build");
      return;
    }

    try {
      await deleteDoc(doc(dbLite, "pcpart_builds", id));
      alert("Build removed successfully");
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert("Error removing the build");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      class="btn btn-sm btn-danger"
      onClick={handleClick}
      title="Remove Build"
      aria-label="Remove Build"
    >
      {isLoading ? (
        <div className="flex items-center justify-center size-4">
          <div className="animate-spin rounded-full size-4 border-2 border-red-500 border-t-transparent" />
        </div>
      ) : (
        <Trash size={16} />
      )}
    </button>
  );
};
