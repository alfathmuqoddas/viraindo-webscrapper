import { useMemo } from "preact/hooks";
import { type TBuild } from "@/type";
import { currencyFormatter } from "@/lib/helper";
import { formatTimestampDate } from "@/lib/helper";

interface Props {
  build: TBuild & { id: string };
}

export const BuildCard = ({ build }: Props) => {
  const parts = build?.parts ?? [];

  const keyParts = useMemo(
    () =>
      parts.filter((p) => {
        const type = p.type?.toLowerCase();
        return type === "processor" || type === "gpu";
      }),
    [parts],
  );

  const totalPrice = useMemo(
    () => parts.reduce((acc, part) => acc + (part.price ?? 0), 0),
    [parts],
  );

  return (
    <a
      href={`/completed-builds/${build.id}`}
      class="block h-full group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
    >
      <article class="bg-white flex flex-col gap-2 shadow hover:shadow-lg rounded-lg p-3 h-full cursor-pointer transition-shadow duration-200">
        {/* card header */}
        <header class="flex items-center gap-2">
          <figure class="size-8 rounded-full overflow-hidden shrink-0">
            <img
              src={build.userPhotoUrl}
              alt={`${build.userName}'s profile picture`}
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
            />
          </figure>
          <span>
            <p class="text-sm font-bold truncate">{build.userName}</p>
            <p class="text-xs text-gray-500">
              {formatTimestampDate({
                type: "relative",
                timestamp: build.createdAt,
              })}
            </p>
          </span>
        </header>

        {/* card body */}
        <div class="flex flex-col gap-2 flex-1">
          <h2 class="font-bold group-active:text-blue-500 group-hover:text-blue-500 line-clamp-2 transition-colors duration-200">
            {build.title}
          </h2>
          <div class="flex flex-col gap-1">
            {keyParts.map((part) => (
              <span class="text-xs text-gray-500">{part.model}</span>
            ))}
          </div>
        </div>

        {/* card footer */}
        <footer class="pt-2 border-t border-gray-300 mt-auto">
          <p class="text-sm font-semibold">
            {currencyFormatter.format(totalPrice)}
          </p>
        </footer>
      </article>
    </a>
  );
};
