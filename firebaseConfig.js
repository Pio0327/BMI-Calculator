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
  // REPLACE THESE WITH YOUR FIREBASE CONFIG VALUES
  apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx", // Your API key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance (for login/signup)
export const auth = getAuth(app);

// Get Firestore instance (for database)
export const db = getFirestore(app);

// Export app for other uses if needed
export default app;
