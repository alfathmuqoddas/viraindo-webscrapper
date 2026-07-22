// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { type Analytics, getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCz2MdCmJWh3UGv7WUeeXEl3oDEJvZyO_U",
  authDomain: "fir-project-66397.firebaseapp.com",
  projectId: "fir-project-66397",
  storageBucket: "fir-project-66397.firebasestorage.app",
  messagingSenderId: "1075650924441",
  appId: "1:1075650924441:web:3fabf67d00d39eba294d08",
  measurementId: "G-4P0NYVZD5C",
};

const isBrowser = typeof window !== "undefined";

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let analytics: Analytics;

if (isBrowser) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  analytics = getAnalytics(app);
} else
  ((auth = {} as Auth), (db = {} as Firestore), (analytics = {} as Analytics));

export const googleAuthProvider = isBrowser
  ? new GoogleAuthProvider()
  : undefined;
export { auth, db, analytics };
