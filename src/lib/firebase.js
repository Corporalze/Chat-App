import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatapp-68170.firebaseapp.com",
  projectId: "chatapp-68170",
  storageBucket: "chatapp-68170.appspot.com",
  messagingSenderId: "33970835915",
  appId: "1:33970835915:web:665977222da64b9913e64e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
