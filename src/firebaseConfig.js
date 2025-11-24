// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";   // 🔥 Firestore (users, orders)
import { getStorage } from "firebase/storage";       // 🔥 Storage (profile images)

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDcwZNQvH6iFZDrQ-VtEbv1YnA8mFonEkE",
  authDomain: "sfykart.firebaseapp.com",
  projectId: "sfykart",
  storageBucket: "sfykart.firebasestorage.app",
  messagingSenderId: "967328398147",
  appId: "1:967328398147:web:cd21156ed89324facb8df6"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);            // For OTP + Email Login
export const db = getFirestore(app);         // For user profiles, orders, addresses
export const storage = getStorage(app);      // For profile picture upload etc.

export default app;
