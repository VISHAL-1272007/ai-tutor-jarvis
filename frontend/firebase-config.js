// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, getDoc, setDoc, limit, startAfter, endBefore, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL-9W-Dxg-FVwKTQ9NYwwYVpBiSNXaZIg",
  authDomain: "vishai-f6197.firebaseapp.com",
  projectId: "vishai-f6197",
  storageBucket: "vishai-f6197.firebasestorage.app",
  messagingSenderId: "701619193996",
  appId: "1:701619193996:web:d025fe39233684515f53a9",
  measurementId: "G-FWG97PQ6G3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Export for use in other files (with pagination support)
export { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, signOut, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, getDoc, setDoc, limit, startAfter, endBefore, limitToLast };
