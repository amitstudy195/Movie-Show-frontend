import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtJu50WNq2dZ8_2aWx1ChwRivZBODa5Sk",
  authDomain: "movie-show-3afe6.firebaseapp.com",
  projectId: "movie-show-3afe6",
  storageBucket: "movie-show-3afe6.firebasestorage.app",
  messagingSenderId: "123596114206",
  appId: "1:123596114206:web:6eff6214162fd2353be10f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
