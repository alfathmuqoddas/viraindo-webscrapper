import { useGetBuilds } from "@/hooks/useGetBuilds";
import BuildCard from "./BuildCard";

export default function CompletedBuildsPage() {
  const { builds, isLoading, error, loadMore, isLoadingMore, hasMore } =
    useGetBuilds({ userId: undefined });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {builds.map((build) => (
          <BuildCard build={build} key={build.id} />
        ))}
      </div>
      {hasMore && (
        <button
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-md disabled:opacity-50 cursor-pointer"
          onClick={loadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? (
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <span>Load more</span>
          )}
        </button>
      )}
    </div>
  );
}
