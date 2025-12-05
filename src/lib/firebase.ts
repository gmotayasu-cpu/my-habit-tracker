import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyClpT5N_mDK7BZ18n-efLNACnPAmQ1FL2E",
    authDomain: "habit-tracker-b9b45.firebaseapp.com",
    projectId: "habit-tracker-b9b45",
    storageBucket: "habit-tracker-b9b45.firebasestorage.app",
    messagingSenderId: "643937334454",
    appId: "1:643937334454:web:6aa31b18c96e2820e4e217",
    measurementId: "G-C7P5P8C6N4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
