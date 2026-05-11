/**
 * Firebase Configuration File
 * 
 * This file initializes Firebase with your project credentials.
 * You need to replace the placeholder values with your actual Firebase config.
 * 
 * HOW TO GET YOUR CONFIG:
 * 1. Go to https://firebase.google.com/console
 * 2. Click on your project
 * 3. Go to Settings (gear icon) > Project Settings
 * 4. Scroll down to "Your apps" and click Web app (</> icon)
 * 5. Copy the firebaseConfig object below
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // TODO: Replace with your actual Firebase config from Firebase Console
   apiKey: "AIzaSyAVPOoMSijc4LAq6xuaEzlkd4adw0N9kHQ",
  authDomain: "bmi-macro-calculator.firebaseapp.com",
  projectId: "bmi-macro-calculator",
  storageBucket: "bmi-macro-calculator.firebasestorage.app",
  messagingSenderId: "623387757287",
  appId: "1:623387757287:web:a8626bbc05661095c5f042",
  measurementId: "G-Z3XL06GG16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance (for login/signup)
export const auth = getAuth(app);

// Get Firestore instance (for database)
export const db = getFirestore(app);

// Export app for other uses if needed
export default app;
