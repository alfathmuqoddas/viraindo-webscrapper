import { useState, useEffect, useRef } from "preact/hooks";
import { db } from "@/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { CommentCard } from "./CommentCard";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  where,
  type QueryDocumentSnapshot,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { type TComment, type TCommentWithoutId } from "./index";

export const CommentLists = ({ buildId }: { buildId: string }) => {
  const PAGE_SIZE = 10;
  const { user, loading: authLoading } = useAuth();

  const [pages, setPages] = useState<Record<number, TComment[]>>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const unsubscribersRef = useRef<Array<() => void>>([]);

  const cleanUpListeners = () => {
    unsubscribersRef.current.forEach((unsubscribe) => unsubscribe());
    unsubscribersRef.current = [];
  };

  useEffect(() => {
    if (!buildId) return;

    setLoading(true);
    setPages({});
    setHasMore(false);
    lastDocRef.current = null;
    cleanUpListeners();

    const q = query(
      collection(db, "pcpart_comments"),
      where("buildId", "==", buildId),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const pageDocs: TComment[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as TCommentWithoutId),
        }));

        if (snapshot.docs.length > 0) {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        if (snapshot.docs.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setHasMore(snapshot.docs.length === PAGE_SIZE);

        setPages((prev) => ({ ...prev, 0: pageDocs }));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching initial comments: ", error);
        setLoading(false);
      },
    );

    unsubscribersRef.current.push(unsub);

    return () => cleanUpListeners();
  }, [buildId]);

  const loadMoreComments = () => {
    if (!hasMore || loadingMore || !lastDocRef.current) return;

    setLoadingMore(true);
    const currentPageIndex = Object.keys(pages).length;

    const nextQuery = query(
      collection(db, "pcpart_comments"),
      where("buildId", "==", buildId),
      orderBy("createdAt", "desc"),
      startAfter(lastDocRef.current),
      limit(PAGE_SIZE),
    );

    const unsub = onSnapshot(
      nextQuery,
      (snapshot) => {
        const newDocs: TComment[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as TCommentWithoutId),
        }));

        if (snapshot.docs.length > 0) {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        if (snapshot.docs.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setHasMore(snapshot.docs.length === PAGE_SIZE);

        setPages((prev) => ({
          ...prev,
          [currentPageIndex]: newDocs,
        }));

        setLoadingMore(false);
      },
      (error) => {
        console.error("Error fetching more comments: ", error);
        setLoadingMore(false);
      },
    );

    unsubscribersRef.current.push(unsub);
  };

  const comments = Object.values(pages).flat();

  if (loading) {
    return <div className="flex justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-2">
      {comments.length === 0 ? (
        <div className="text-sm text-gray-500">No comments yet.</div>
      ) : (
        comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            user={user}
            authLoading={authLoading}
          />
        ))
      )}

      <div className="flex justify-center">
        {hasMore && comments.length >= PAGE_SIZE && (
          <button className="btn btn-primary btn-sm" onClick={loadMoreComments}>
            {loadingMore ? "Loading..." : "Load More Comments"}
          </button>
        )}
      </div>
    </div>
  );
};
