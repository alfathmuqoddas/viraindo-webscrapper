import { useState, useCallback, useEffect } from "preact/hooks";
import { ArrowUpDown } from "lucide-preact";
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

type TOrder = "latest" | "oldest" | "highestPrice" | "lowestPrice";

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
  const [order, setOrder] = useState<TOrder>("latest");
  const [cursor, setCursor] = useState<
    number | string | QueryDocumentSnapshot<DocumentData> | null
  >(initialCursorValue);

  const fetchBuilds = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const postRef = collection(dbLite, "pcpart_builds");

      const constraints: QueryConstraint[] = [where("isPublished", "==", true)];

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

      switch (order) {
        case "latest":
          constraints.push(orderBy("createdAt", "desc"));
          break;
        case "oldest":
          constraints.push(orderBy("createdAt", "asc"));
          break;
        case "highestPrice":
          constraints.push(orderBy("price", "desc"));
          break;
        case "lowestPrice":
          constraints.push(orderBy("price", "asc"));
          break;
        default:
          constraints.push(orderBy("createdAt", "desc"));
      }

      if (cursor) {
        constraints.push(startAfter(cursor));
      }

      constraints.push(limit(PAGE_LIMIT));

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

  useEffect(() => {
    fetchBuilds();
  }, [order]);

  return (
    <>
      <div class="mb-4 flex gap-1 items-center">
        <label for="order" class="">
          Order By: &nbsp;
        </label>
        <select
          id="order"
          name="order"
          class="border border-gray-200 rounded-lg px-2 py-1 bg-white"
          onChange={(e) => {
            setOrder(e.currentTarget.value as TOrder);
            setCursor(null);
            setBuilds([]);
            setHasMore(true);
          }}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="highestPrice">Highest Price</option>
          <option value="lowestPrice">Lowest Price</option>
        </select>
      </div>
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
