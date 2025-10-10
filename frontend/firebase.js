// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "abhay-food.firebaseapp.com",
  projectId: "abhay-food",
  storageBucket: "abhay-food.firebasestorage.app",
  messagingSenderId: "952233561797",
  appId: "1:952233561797:web:3d95f5330eb749a23c6aac",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
