// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDAM6eXzcejwyfR6TbFkSj_RxYod_y6Su0",
  authDomain: "skyteck-liga.firebaseapp.com",
  projectId: "skyteck-liga",
  storageBucket: "skyteck-liga.firebasestorage.app",
  messagingSenderId: "853376548411",
  appId: "1:853376548411:web:ff92c95678f0a5907fe61e"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
