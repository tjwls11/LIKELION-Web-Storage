import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyBPq7L7OxFYY1My2zkhYcveZ_AlIlwtE1E",
  authDomain:        "likelion-324f8.firebaseapp.com",
  projectId:         "likelion-324f8",
  storageBucket:     "likelion-324f8.firebasestorage.app",
  messagingSenderId: "895962534103",
  appId:             "1:895962534103:web:3ad90df2f045513d692092",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
