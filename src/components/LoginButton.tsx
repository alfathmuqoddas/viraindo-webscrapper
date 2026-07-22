import { useAuth } from "@/hooks/useAuth";
import { auth, googleAuthProvider } from "@/firebase/client";
import { signInWithPopup, signOut } from "firebase/auth";
import { LogOut } from "lucide-preact";

export const LoginButton = () => {
  const { user, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
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
      <div class="flex items-center gap-2">
        <span class="text-white hidden text-sm font-medium md:block">
          {user.name}
        </span>
        <button
          onClick={handleLogout}
          class="text-red-400 hover:text-red-500 active:text-red-500 cursor-pointer"
        >
          <LogOut class="" size={16} strokeWidth={3} />
        </button>
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
