import { useEffect, useState } from "preact/hooks";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/client";

export type UserProfile = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
