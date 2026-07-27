import { useState, useEffect, useRef } from "preact/hooks";
import { useAuth } from "@/hooks/useAuth";
import { auth, googleAuthProvider } from "@/firebase/client";
import { signInWithPopup, signOut } from "firebase/auth";
import { LogOut, ChevronDown } from "lucide-preact";

export const LoginButton = () => {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const profileMenu = [
    {
      label: "My Builds",
      href: "/my-builds",
      icon: null,
    },
    {
      label: "My Profile",
      href: "/my-profile",
      icon: null,
    },
    {
      label: "Logout",
      href: "#",
      icon: LogOut,
    },
  ];

  const handleLogin = async () => {
    try {
      if (googleAuthProvider) {
        await signInWithPopup(auth, googleAuthProvider);
      }
    } catch (error) {
      console.error("failed to login: ", error);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("failed to logout: ", error);
      }
    }
  };

  if (loading)
    return <span class="animate-pulse text-xs text-white">Loading...</span>;

  if (user) {
    return (
      <div ref={profileDropdownRef} class="relative inline-block">
        <button
          id="loginButton"
          class="group flex items-center gap-1 p-1 rounded-full hover:bg-gray-800 active:bg-gray-800 text-white"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <figure class="size-8 rounded-full overflow-hidden shrink-0">
            <img
              src={user.photoURL ?? ""}
              alt={`${user.name ?? "User"}'s profile picture`}
              class="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </figure>
          <ChevronDown
            size={12}
            className={`${isOpen ? "rotate-180" : ""} transition-transform duration-200`}
          />
        </button>
        {isOpen && (
          <div
            id="profileMenu"
            class="animate-fade-in fixed inset-x-2 top-14 h-auto bg-white md:absolute md:inset-auto md:top-full md:right-0 md:mt-2 md:w-32 z-50 rounded-md shadow"
          >
            <ul className="p-2 text-sm" aria-labelledby="dropdownDefaultButton">
              {profileMenu.map((menu) => (
                <li key={menu.label}>
                  {menu.label === "Logout" ? (
                    <button
                      id="logoutButton"
                      onClick={handleLogout}
                      className="inline-flex justify-between cursor-pointer items-center w-full p-2 hover:bg-blue-400 hover:text-white rounded-md"
                    >
                      {menu.label}
                      <LogOut size={12} className="text-red-500" />
                    </button>
                  ) : (
                    <a
                      id={menu.href.replace("/", "")}
                      href={menu.href}
                      className="inline-flex items-center w-full p-2 hover:bg-blue-400 hover:text-white rounded-md"
                    >
                      {menu.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      class="bg-blue-500 hover:bg-blue-600 active:bg-blue-600 text-white text-sm font-medium px-2 py-1 cursor-pointer rounded-md"
      onClick={handleLogin}
    >
      Login
    </button>
  );
};
