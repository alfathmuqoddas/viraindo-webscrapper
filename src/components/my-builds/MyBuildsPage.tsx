import { useState, useEffect, useCallback } from "preact/hooks";
import { dbLite } from "@/firebase/client";
import {
  query,
  collection,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore/lite";
import { useAuth } from "@/hooks/useAuth";
import { RemoveMyBuild } from "@/components/my-builds/RemoveMyBuild";
import type { TBuild } from "@/type";

export const MyBuildsPage = () => {
  const [builds, setBuilds] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData>>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid ?? "";

  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!uid) return;

    const fetchInitialMyBuilds = async () => {
      setIsLoading(true);

      try {
        const colRef = collection(dbLite, "pcpart_builds");

        const q = query(
          colRef,
          where("userId", "==", uid),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE),
        );

        const snapshot = await getDocs(q);

        const fetchedMyBuilds = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as TBuild),
        }));

        setBuilds(fetchedMyBuilds);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setError(null);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialMyBuilds();
  }, [uid]);

  const handleRemoveSuccess = (removedBuildId: string) => {
    setBuilds((prev) => prev.filter((build) => build.id !== removedBuildId));
  };

  const loadMoreMyBuilds = useCallback(async () => {
    if (!uid || !lastDoc || isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const colRef = collection(dbLite, "pcpart_builds");
      const q = query(
        colRef,
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );

      const snapshot = await getDocs(q);

      const newMyBuilds = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as TBuild),
      }));

      setBuilds((prev) => [...prev, ...newMyBuilds]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [uid, lastDoc, isLoading, hasMore]);

  if (authLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-600">
        You're not authorized to view this page
      </div>
    );
  }

  return (
    <>
      {isLoading && builds.length === 0 ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300" />
        </div>
      ) : error ? (
        <div className=""> Error: {error}</div>
      ) : (
        <>
          <h2 className="mb-2">
            You have {builds.length} build{builds.length === 1 ? "" : "s"}
          </h2>
          <div className="overflow-x-auto border w-full text-sm mb-4">
            <table className="w-full min-w-xl bg-white">
              <thead>
                <tr className="bg-black text-white text-left uppercase tracking-wider text-xs">
                  <th className="p-3 w-[5%] text-center font-bold">No</th>
                  <th className="p-3 w-[25%] font-bold">Title</th>
                  <th className="p-3 w-[35%] font-bold">Description</th>
                  <th className="p-3 w-[12%] text-center font-bold whitespace-nowrap">
                    Date Created
                  </th>
                  <th className="p-3 w-[12%] text-center font-bold whitespace-nowrap">
                    Date Edited
                  </th>
                  <th className="p-3 w-[11%] text-center font-bold whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!builds || builds.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-3 text-center text-gray-500 font-mono"
                    >
                      No builds found
                    </td>
                  </tr>
                ) : (
                  builds.map((build, index) => (
                    <tr key={build.id} className="">
                      <td className="p-3 align-middle truncate">{index + 1}</td>
                      <td className="p-3 align-middle wrap-break-words">
                        <a
                          href={`/completed-builds/${build.id}`}
                          class="text-blue-500 hover:underline active:underline underline-offset-2"
                        >
                          {build.title}
                        </a>
                      </td>
                      <td className="p-3 align-middle text-sm max-w-xs truncate">
                        {build.description}
                      </td>
                      <td className="p-3 align-middle text-center">
                        {build?.createdAt
                          ?.toDate?.()
                          ?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                      </td>
                      <td className="p-3 align-middle text-center">
                        {build?.updatedAt
                          ?.toDate?.()
                          ?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                      </td>
                      <td className="p-3 align-middle text-center">
                        <RemoveMyBuild
                          id={build.id}
                          userId={build.userId}
                          onSuccess={() => handleRemoveSuccess(build.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-md disabled:opacity-50 cursor-pointer"
            onClick={loadMoreMyBuilds}
            disabled={isLoading}
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
};
