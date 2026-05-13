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

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAVPOoMSijc4LAq6xuaEzlkd4adw0N9kHQ",
  authDomain: "bmi-macro-calculator.firebaseapp.com",
  projectId: "bmi-macro-calculator",
  storageBucket: "bmi-macro-calculator.firebasestorage.app",
  messagingSenderId: "623387757287",
  appId: "1:623387757287:web:a8626bbc05661095c5f042"
};

console.log('🔥 Firebase Config loaded');

// Initialize Firebase only if not already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} else {
  app = getApps()[0];
  console.log('✅ Firebase app already initialized');
}

// Initialize Auth
const auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

// Initialize Firestore
const db = getFirestore(app);
console.log('✅ Firestore DB initialized');

export { auth, db, app };
