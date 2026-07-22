import { type TBuild } from "@/type";
import { memo, useMemo } from "preact/compat";
import { currencyFormatter } from "@/lib/helper";
import { navigate } from "astro:transitions/client";

function BuildCard({ build }: { build: TBuild & { id: string } }) {
  const keyParts = useMemo(
    () => build.parts.filter((p) => p.type === "processor" || p.type === "gpu"),
    [build.parts],
  );

  const totalPrice = useMemo(
    () => build.parts.reduce((acc, part) => acc + part.price, 0),
    [build.parts],
  );
  const handleNavigate = () => {
    navigate(`/completed-builds/${build.id}`);
  };
  return (
    <div
      key={build.id}
      class="bg-white flex flex-col gap-2 shadow rounded-md p-2 group h-full"
    >
      {/* card header */}
      <div class="flex items-center gap-2">
        <figure class="w-6 h-6 rounded-full overflow-hidden shrink-0">
          <img
            src={build.userPhotoUrl}
            alt={`${build.userName}'s profile picture`}
            class="w-full h-full object-cover"
          />
        </figure>
        <p class="text-sm truncate">{build.userName}</p>
      </div>

      {/* card body */}
      <div className="flex flex-col gap-2 flex-1">
        <h2
          class="font-bold cursor-pointer group-hover:text-blue-500 line-clamp-2"
          onClick={handleNavigate}
        >
          {build.title}
        </h2>
        <div className="flex flex-col gap-1">
          {keyParts.map((part, idx) => (
            <span key={part.id ?? idx} className="text-xs text-gray-500">
              {part.model}
            </span>
          ))}
        </div>
      </div>

      {/* card footer */}
      <div className="pt-2 border-t border-gray-300 mt-auto">
        <p className="text-sm font-semibold">
          {currencyFormatter.format(totalPrice)}
        </p>
      </div>
    </div>
  );
}

export default memo(BuildCard);
