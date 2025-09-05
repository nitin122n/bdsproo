import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check if Firebase environment variables are configured
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                            process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-api-key-here';

const firebaseConfig = isFirebaseConfigured ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
} : {
  // Fallback config for development (will show warning)
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase only if no apps exist (prevents duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = typeof window !== 'undefined' ? getAuth(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = typeof window !== 'undefined' ? getFirestore(app) : null;

// Google Auth Provider
export const googleProvider = typeof window !== 'undefined' ? new GoogleAuthProvider() : null;

// Warning for missing Firebase configuration
if (!isFirebaseConfigured && typeof window !== 'undefined') {
  console.warn('⚠️ Firebase configuration not found. Please set up your Firebase environment variables in .env.local');
  console.warn('📝 Create a .env.local file with your Firebase project credentials');
}

export default app;
