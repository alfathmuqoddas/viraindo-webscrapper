import { useState, useEffect, useCallback } from "preact/hooks";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase/client"; // Your firebase path
import type { TBuild } from "@/type";

const PAGE_SIZE = 10;

export const useGetBuilds = ({ userId }: { userId?: string } = {}) => {
  const [builds, setBuilds] = useState<(TBuild & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Store the last fetched document snapshot as the cursor
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Track if there are remaining documents to load
  const [hasMore, setHasMore] = useState(true);

  // Initial load (runs on mount or when userId changes)
  useEffect(() => {
    let isMounted = true;

    const fetchInitialBuilds = async () => {
      setIsLoading(true);
      setError(null);
      setHasMore(true);

      try {
        const condition = userId
          ? where("userId", "==", userId)
          : where("isPublished", "==", true);

        // Fetch PAGE_SIZE items ordered by createdAt
        const q = query(
          collection(db, "pcpart_builds"),
          condition,
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE),
        );

        const querySnapshot = await getDocs(q);

        if (isMounted) {
          const fetchedBuilds = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as TBuild),
          }));

          setBuilds(fetchedBuilds);

          // Save the last document snapshot for pagination
          const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          setLastDoc(lastVisible || null);

          // If fetched docs are less than PAGE_SIZE, we reached the end
          if (querySnapshot.docs.length < PAGE_SIZE) {
            setHasMore(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          console.error("Error fetching initial builds:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialBuilds();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Load next 10 items
  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const condition = userId
        ? where("userId", "==", userId)
        : where("isPublished", "==", true);

      // Pass the last document snapshot to startAfter
      const q = query(
        collection(db, "pcpart_builds"),
        condition,
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );

      const querySnapshot = await getDocs(q);

      const newBuilds = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as TBuild),
      }));

      // Append new items to existing list
      setBuilds((prev) => [...prev, ...newBuilds]);

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible || null);

      if (querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err as Error);
      console.error("Error loading more builds:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [lastDoc, hasMore, isLoadingMore, userId]);

  return {
    builds,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
  };
};
