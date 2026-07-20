// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCz2MdCmJWh3UGv7WUeeXEl3oDEJvZyO_U",
  authDomain: "fir-project-66397.firebaseapp.com",
  projectId: "fir-project-66397",
  storageBucket: "fir-project-66397.firebasestorage.app",
  messagingSenderId: "1075650924441",
  appId: "1:1075650924441:web:3fabf67d00d39eba294d08",
  measurementId: "G-4P0NYVZD5C",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
