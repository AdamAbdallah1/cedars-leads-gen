// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA02zmaY8rL7UmGNl3D9Y-8bgjLI0vKPD0",
  authDomain: "cedarsleadauth.firebaseapp.com",
  projectId: "cedarsleadauth",
  storageBucket: "cedarsleadauth.firebasestorage.app",
  messagingSenderId: "1060613666498",
  appId: "1:1060613666498:web:1d3ca1bdef58beee19ad5b",
  measurementId: "G-5V1VWB4ZDS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
