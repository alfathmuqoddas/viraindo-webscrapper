import { useState, useCallback, useEffect } from "preact/hooks";
import { type TBuild } from "@/type";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  startAfter,
  Timestamp,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore/lite";
import { dbLite } from "@/firebase/client";
import { BuildCard } from "./BuildCard";

type TCompletedBuildPageProps = {
  initialBuilds: (TBuild & { id: string })[];
  initialHasMore: boolean;
  initialCursorValue: number | string | null;
};

const PAGE_LIMIT = 12;

export const CompletedBuildPage = ({
  initialBuilds,
  initialHasMore,
  initialCursorValue,
}: TCompletedBuildPageProps) => {
  const [builds, setBuilds] =
    useState<(TBuild & { id: string })[]>(initialBuilds);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState<
    number | string | QueryDocumentSnapshot<DocumentData> | null
  >(initialCursorValue);

  const fetchBuilds = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const postRef = collection(dbLite, "pcpart_builds");

      let cursorParam:
        | QueryDocumentSnapshot<DocumentData>
        | Timestamp
        | string
        | null = null;

      if (typeof cursor === "number") {
        cursorParam = Timestamp.fromMillis(cursor);
      } else {
        cursorParam = cursor;
      }

      const constraints: QueryConstraint[] = [
        where("isPublished", "==", true),
        orderBy("createdAt", "desc"),
        ...(cursorParam !== null ? [startAfter(cursorParam)] : []),
        limit(PAGE_LIMIT),
      ];

      const q = query(postRef, ...constraints);
      const snapshot = await getDocs(q);

      const newBuilds = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as TBuild),
      }));

      setBuilds((prev) => [...prev, ...newBuilds]);

      const lastSnapshot = snapshot.docs[snapshot.docs.length - 1];
      setCursor(lastSnapshot);

      if (snapshot.docs.length < PAGE_LIMIT) {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading]);

  return (
    <>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {builds?.map((build) => (
          <BuildCard key={build.id} build={build} />
        ))}
      </div>
      <nav className="flex justify-center">
        {hasMore ? (
          <button
            onClick={fetchBuilds}
            class="btn btn-primary btn-sm"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        ) : (
          <></>
        )}
      </nav>
    </>
  );
};
