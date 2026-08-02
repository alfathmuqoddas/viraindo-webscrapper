import { useState } from "preact/hooks";
import { db } from "@/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export const CommentForm = ({ buildId }: { buildId: string }) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_COMMENT_LENGTH = 500;

  const { user, loading: loadingAuth } = useAuth();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const trimmedComment = comment.trim();
    if (!trimmedComment || trimmedComment.length > MAX_COMMENT_LENGTH) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "pcpart_comments"), {
        userId: user?.uid ?? "",
        userEmail: user?.email ?? "",
        userName: user?.name ?? "",
        userPhotoUrl: user?.photoURL ?? "",
        comment: comment,
        buildId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setComment("");
      alert("Comment added successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth) {
    return <div className="text-sm text-gray-500">Loading auth state...</div>;
  }

  if (!user) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
        Please log in to add a comment.
      </div>
    );
  }

  const remainingChars = MAX_COMMENT_LENGTH - comment.length;
  const isNearLimit = remainingChars <= 50;

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div className="flex justify-between items-center">
        <label htmlFor="comment" className="font-bold">
          Comment
        </label>
        <span
          className={`text-xs ${
            isNearLimit ? "text-amber-600 font-semibold" : "text-gray-400"
          }`}
        >
          {comment.length} / {MAX_COMMENT_LENGTH}
        </span>
      </div>
      <textarea
        id="comment"
        className="w-full h-24 p-3 border rounded-md text-sm bg-white border-gray-300"
        name="comment"
        maxLength={MAX_COMMENT_LENGTH}
        value={comment}
        placeholder="Write a comment about this build..."
        onInput={(e) => setComment((e.target as HTMLTextAreaElement).value)}
        required
      />
      <button
        type="submit"
        class="btn btn-sm btn-primary"
        disabled={isSubmitting || !comment.trim()}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};
