import { useState } from "preact/hooks";
import { type TComment } from "./index";
import { formatTimestampDate } from "@/lib/helper";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { type UserProfile } from "@/hooks/useAuth";

export const CommentCard = ({
  comment,
  user,
  authLoading,
}: {
  comment?: TComment;
  user?: UserProfile | null;
  authLoading?: boolean;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    if (!comment?.id || !user?.uid) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "pcpart_comments", comment.id));
    } catch (error) {
      console.error("Failed to delete comment: ", error);
      alert("Error deleting the comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = Boolean(
    user?.uid && comment?.userId && user.uid === comment.userId,
  );

  return (
    <div className="flex gap-2 items-start">
      <figure className="size-8 rounded-full overflow-hidden shrink-0">
        <img
          src={comment?.userPhotoUrl}
          alt={`${comment?.userName || "User"}'s profile picture`}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </figure>
      <div className="space-y-1">
        <div className="flex items-end gap-2">
          <p className="text-sm font-bold truncate">{comment?.userName}</p>
          <p className="text-xs text-gray-500">
            {formatTimestampDate({
              type: "relative",
              timestamp: comment?.createdAt,
            })}
          </p>
        </div>
        <p className="text-sm wrap-break-word">{comment?.comment}</p>

        {isAuthor && (
          <div className="flex gap-2 items-center">
            <button
              className="text-red-500 hover:underline active:underline underline-offset-2 text-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDeleting || authLoading}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
