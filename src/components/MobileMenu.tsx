import { useState, useEffect } from "preact/hooks";
import { NavMenuItems } from "@/components/NavMenu";
import { Menu } from "lucide-preact";

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        class="active:text-blue-500 text-gray-400 cursor-pointer md:hidden"
        aria-label="Open mobile menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu class="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black opacity-90 transition-opacity py-16"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex flex-col items-center gap-6">
            {NavMenuItems.map((item) => {
              return (
                <a
                  href={`${import.meta.env.BASE_URL}${item.href}`}
                  class="flex items-center gap-1 group"
                >
                  <item.icon class="h-6 w-6 text-gray-400 group-hover:text-blue-400 group-active:text-blue-400" />
                  <span class="text-sm font-medium text-white">
                    {item.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
