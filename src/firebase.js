// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMAt6sUHLq2_xryj9hFFr9iP7_DaH4nsk",
  authDomain: "roomfinder-d28bf.firebaseapp.com",
  projectId: "roomfinder-d28bf",
  storageBucket: "roomfinder-d28bf.firebasestorage.app",
  messagingSenderId: "406174453777",
  appId: "1:406174453777:web:5c841666586502cb58e1b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);