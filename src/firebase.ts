// Firebase initialization and exports
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAIrDjFDHg6ziZ0E7fEGYkA8vqEepRRItw",
  authDomain: "the-spark-books.firebaseapp.com",
  projectId: "the-spark-books",
  // Use the correct bucket name that has CORS configured
  storageBucket: "the-spark-books.firebasestorage.app",
  messagingSenderId: "219292792958",
  appId: "1:219292792958:web:37102675b97a0b697c402f",
  measurementId: "G-7MCT3M96R7",
}

const app = initializeApp(firebaseConfig)
let analytics: ReturnType<typeof getAnalytics> | null = null
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app)
  } catch (e) {
    // analytics may fail in some environments; ignore silently
  }
}

const db = getFirestore(app)
// Use the correct bucket name that matches the CORS configuration
const storage = getStorage(app, 'gs://the-spark-books.firebasestorage.app')
const auth = getAuth(app)

// Ensure there is an authenticated Firebase user for operations that require auth (e.g., Storage writes)
export async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth)
    } catch (error) {
      console.error('Anonymous sign-in failed:', error)
      throw error
    }
  }
}

export { app, analytics, db, storage, auth }
