import { Hammer, PackageSearch, MonitorSmartphone } from "lucide-preact";
export const NavMenuItems = [
  {
    name: "Builder",
    href: "builder",
    icon: Hammer,
  },
  {
    name: "Products",
    href: "products",
    icon: PackageSearch,
  },
  {
    name: "Completed Builds",
    href: "completed-builds",
    icon: MonitorSmartphone,
  },
];

export const NavMenu = () => {
  return (
    <div class="flex items-center gap-4">
      {NavMenuItems.map((item, index) => {
        return (
          <a
            href={`${import.meta.env.BASE_URL}${item.href}`}
            class="flex items-center gap-1 group"
          >
            <item.icon class="h-6 w-6 text-gray-400 group-hover:text-blue-400 group-active:text-blue-400" />
            <span class="hidden md:block text-sm font-medium text-white">
              {item.name}
            </span>
          </a>
        );
      })}
    </div>
  );
};
