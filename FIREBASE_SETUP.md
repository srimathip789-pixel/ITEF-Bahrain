# Firebase Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add Project"**
3. Enter project name: `itef-quiz`
4. Click **Continue**
5. **Disable** Google Analytics (optional)
6. Click **Create Project**
7. Wait ~30 seconds for setup to complete

### Step 2: Register Web App
1. In Firebase Console, click the **Web icon** (</>)
2. Enter app nickname: `itef-quiz-app`
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **Register app**

### Step 3: Get Firebase Config
You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "itef-quiz.firebaseapp.com",
  projectId: "itef-quiz",
  storageBucket: "itef-quiz.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 4: Create .env File
1. Copy `.env.example` to `.env` in your project root
2. Fill in the values from Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=itef-quiz.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=itef-quiz
VITE_FIREBASE_STORAGE_BUCKET=itef-quiz.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 5: Enable Firestore Database
1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create Database**
3. Select **Start in test mode** (for development)
4. Choose your location (closest to your users)
5. Click **Enable**

### Step 6: Set Firestore Rules
Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow write to winners and attempts
    match /winners/{winnerId} {
      allow write: if true;
    }
    
    match /attempts/{attemptId} {
      allow write: if true;
    }
  }
}
```

### Step 7: Test Locally
1. Restart your dev server: `npm run dev`
2. Open http://localhost:5173
3. Complete a puzzle
4. Check Firebase Console → Firestore → You should see data!

### Step 8: Deploy to Vercel
1. Push to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables (from `.env`)
5. Deploy!

## ✅ You're Done!

Your quiz app now has:
- ♾️ Permanent data storage
- 🏆 Winner tracking
- 👥 Attendee tracking with attempt counts
- 📊 Real-time leaderboards

**Data will NEVER expire** - it stays in Firebase forever! 🎉
