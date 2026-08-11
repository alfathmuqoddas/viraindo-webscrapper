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
import { navigate } from "astro:transitions/client";
import { formatTimestampDate } from "@/lib/helper";
import {
  setParts,
  setTitle,
  setDescription,
  setBuildId,
} from "@/store/partStore";
import { Pencil } from "lucide-preact";

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
          <div className="flex items-end gap-4 justify-between mb-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/builder")}
              title="View all builds"
            >
              + New Build
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-300 w-full text-sm mb-4">
            <table className="w-full min-w-xl bg-white">
              <thead>
                <tr className="bg-black text-white text-left uppercase tracking-wider text-xs">
                  <th className="p-3 w-[5%] text-center font-bold">No</th>
                  <th className="p-3 w-[20%] font-bold">Title</th>
                  <th className="p-3 w-[35%] font-bold">Description</th>
                  <th className="p-3 w-[10%] font-bold">Status</th>
                  <th className="p-3 w-[10%] text-center font-bold whitespace-nowrap">
                    Date Created
                  </th>
                  <th className="p-3 w-[10%] text-center font-bold whitespace-nowrap">
                    Date Edited
                  </th>
                  <th className="p-3 w-[10%] text-center font-bold whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
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
                      <td className="p-3 align-middle max-w-xs">
                        {build.isPublished ? (
                          <span class="text-xs font-medium bg-blue-500 rounded-full px-2 py-1 text-white">
                            Published
                          </span>
                        ) : (
                          <span class="text-xs font-medium bg-gray-500 rounded-full px-2 py-1 text-white">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-3 align-middle text-sm text-center">
                        {formatTimestampDate({
                          type: "simple",
                          timestamp: build?.createdAt,
                        })}
                      </td>
                      <td className="p-3 align-middle text-sm text-center">
                        {formatTimestampDate({
                          type: "simple",
                          timestamp: build?.updatedAt,
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="hover:text-blue-500 active:text-blue-500 text-xs p-1 cursor-pointer"
                            id={`edit-build-${build.id}`}
                            onClick={() => {
                              setParts(build.parts);
                              setTitle(build.title);
                              setDescription(build.description);
                              setBuildId(build.id);
                              navigate(`/builder/edit?buildId=${build.id}`);
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <RemoveMyBuild
                            id={build.id}
                            userId={build.userId}
                            onSuccess={() => handleRemoveSuccess(build.id)}
                          />
                        </div>
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
            className="btn btn-primary"
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
