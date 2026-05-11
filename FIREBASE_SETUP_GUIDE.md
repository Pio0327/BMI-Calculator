# 🔥 Firebase Setup Guide for BMI & Macro Calculator

This guide walks you through setting up Firebase authentication and Firestore database for your app.

---

## **PHASE 1: Create Firebase Project**

### Step 1: Go to Firebase Console
1. Open https://firebase.google.com/
2. Click **"Get Started"** or **"Go to Console"** (top right)
3. Sign in with your Google account

### Step 2: Create a New Project
1. Click **"Create a project"** button
2. Enter project name: `bmi-macro-calculator`
3. Click **"Continue"**
4. Uncheck "Enable Google Analytics" (optional, not needed)
5. Click **"Create project"**
6. Wait for the project to be created (takes 1-2 minutes)

### Step 3: Register Web App
1. Once created, you'll see the project dashboard
2. Click on the **Web icon** (`</>`) to register a web app
3. Enter app name: `BMI Macro Calculator Web`
4. **DO NOT** check "Also set up Firebase Hosting" (we're using Expo)
5. Click **"Register app"**
6. Copy the Firebase configuration object (you'll need this next)

---

## **PHASE 2: Configure Firestore Database**

### Step 4: Enable Firestore
1. In the left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create Database"**
3. Select region: **`us-central1`** (closest to you)
4. Click **"Next"**
5. Select **"Start in production mode"** (we'll set security rules)
6. Click **"Enable"**
7. Wait for database creation (2-3 minutes)

### Step 5: Set Security Rules
1. Click on the **"Rules"** tab in Firestore
2. Replace all content with this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Users can read/write their own daily meals
      match /dailyMeals/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **"Publish"** button
4. Click **"Publish"** to confirm

---

## **PHASE 3: Enable Authentication**

### Step 6: Setup Email/Password Authentication
1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get Started"**
3. Click on **"Email/Password"** provider
4. Toggle the **"Enable"** switch to ON
5. Keep "Password Authentication" enabled
6. **DO NOT** enable "Email Link (Passwordless sign-in)" for now
7. Click **"Save"**

---

## **PHASE 4: Get Your Firebase Config**

### Step 7: Copy Firebase Configuration
1. Click the **Settings icon** (gear) in top right → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Find the app you created, click **`</>`** or copy icon
4. Under "Firebase SDK snippet", select **"Config"**
5. Copy the entire config object

Your config should look like this:
```javascript
{
  apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "bmi-macro-calculator.firebaseapp.com",
  projectId: "bmi-macro-calculator",
  storageBucket: "bmi-macro-calculator.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
}
```

---

## **PHASE 5: Update Your App Configuration**

### Step 8: Update firebaseConfig.js
1. Open `firebaseConfig.js` in your project
2. Replace the placeholder config with your actual Firebase config
3. Your file should look like:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

---

## **PHASE 6: Test Your App**

### Step 9: Run the App
1. Open a terminal in your project directory
2. Run: `npm start`
3. Press `w` to open in web browser
4. App should load at `http://localhost:8082`

### Step 10: Create an Account
1. You'll see a login screen at the top
2. Enter an email: `test@example.com`
3. Enter a password: `password123`
4. Click **"📝 Sign Up"** button
5. You should see **"✅ Account created! You are logged in."**
6. The welcome screen appears with your email

### Step 11: Test Data Saving
1. Fill in the BMI calculator form
2. Add some meals from the daily tracker
3. Click **"💾 Save Daily Record"**
4. You should see **"✅ Meals saved to Firebase!"**
5. Refresh the page - your data should still be there!

### Step 12: Verify in Firebase Console
1. Go back to Firebase Console
2. Click **"Firestore Database"**
3. You should see a `users` collection
4. Expand it to see your user ID
5. Expand `dailyMeals` to see your saved meals

---

## **Features Now Available**

✅ **User Authentication**
- Create account with email/password
- Login/logout functionality
- Session persistence

✅ **Cloud Data Sync**
- Daily meals saved to Firestore
- Access data from any device (after login)
- Data persists even after closing app

✅ **Multi-Country Support**
- User's country selection saved to Firebase
- Automatically loads on next login

---

## **Troubleshooting**

### "Cannot find firebaseConfig module"
- Make sure `firebaseConfig.js` is in the root directory (not inside `app` folder)
- Check your Firebase config values are not `"YOUR_*_HERE"`

### "Auth/invalid-email"
- Email must be in valid format: `user@example.com`
- Avoid special characters in email

### "Auth/weak-password"
- Password must be at least 6 characters
- Try: `password123`, `Test1234`, etc.

### "Cannot write to Firestore"
- Go back to **Firebase Console** → **Firestore** → **Rules**
- Make sure security rules are published correctly
- Ensure you're logged in before saving

### Data not syncing
- Check **Network tab** in browser DevTools
- Verify Firebase config values are correct
- Check Firestore console for errors

---

## **Next Steps (Optional)**

### Add More Features:
1. **Weekly charts** - Show calorie trends
2. **Meal history** - View past meals
3. **Share progress** - Export data as PDF
4. **Achievements** - Unlock badges for milestones

### Deploy to Firebase Hosting:
1. Run: `npm install -g firebase-tools`
2. Run: `firebase login`
3. Run: `firebase init`
4. Run: `npm run build`
5. Run: `firebase deploy`

---

## **Important Notes**

⚠️ **Security:**
- Never commit `firebaseConfig.js` to GitHub if you've added real API keys
- Add to `.gitignore`: `firebaseConfig.js`
- These are technically not secrets (safe for web apps) but good practice

⚠️ **Firestore Costs:**
- Free tier includes: 1 GB storage, 50k read operations/day
- Your app should stay well within free tier limits
- Monitor usage in Firebase Console

⚠️ **Email Verification:**
- Currently app doesn't require email verification
- To add verification, we'd need additional setup

---

## **Questions?**

If you encounter issues:
1. Check Firebase Console for error logs
2. Check browser console (F12) for error messages
3. Verify all configuration steps were completed
4. Restart the development server

Good luck! 🚀
