# 🔥 75 Hard Tracker — Complete Setup Guide
**Built for Sameeraa** · React + Firebase · Claymorphic Design

---

## 📋 Table of Contents

1. [Firebase Project Setup](#1-firebase-project-setup)
2. [Enable Authentication](#2-enable-authentication)
3. [Set Up Firestore Database](#3-set-up-firestore-database)
4. [Security Rules](#4-security-rules)
5. [Get Your Config Keys](#5-get-your-config-keys)
6. [Running the App Locally](#6-running-the-app-locally)
7. [Firebase Hosting (Deployment)](#7-firebase-hosting-deployment)
8. [Data Structure Explained](#8-data-structure-explained)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Firebase Project Setup

### Step 1 — Create a Firebase account
Go to [https://console.firebase.google.com](https://console.firebase.google.com) and sign in with your Google account.

### Step 2 — Create a new project
1. Click **"Add project"**
2. Name it: `75hard-tracker` (or anything you like)
3. Disable Google Analytics (not needed)
4. Click **"Create project"**
5. Wait ~30 seconds for setup to complete

### Step 3 — Add a Web App
1. On the project overview page, click the **`</>`** (Web) icon
2. Give it a nickname: `75hard-web`
3. **Check** "Also set up Firebase Hosting" (optional but recommended)
4. Click **"Register app"**
5. You'll see a `firebaseConfig` object — **COPY IT**, you'll need it in Step 5

---

## 2. Enable Authentication

### Email/Password Sign-In
1. In the Firebase console, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, click **Email/Password**
4. Toggle **Enable** to ON
5. Click **Save**

### Google Sign-In
1. Still in Authentication → Sign-in method
2. Click **Google**
3. Toggle **Enable** to ON
4. Set a **Project support email** (your email)
5. Click **Save**

> ✅ Both providers should now show "Enabled" status.

---

## 3. Set Up Firestore Database

1. In Firebase console, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules in Step 4)
4. Select a Cloud Firestore location closest to you (e.g., `asia-south1` for India)
5. Click **"Enable"**

> ⚠️ Test mode allows open access for 30 days. Add security rules (Step 4) before going live.

---

## 4. Security Rules

In Firestore → **Rules** tab, replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Users can only access their own progress subcollection
      match /progress/{dayId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Click **"Publish"**.

**What these rules do:**
- ✅ Logged-in users can read/write ONLY their own data
- ✅ No user can access another user's data
- ✅ Unauthenticated requests are blocked

---

## 5. Get Your Config Keys

You should have saved the config from Step 1. If not:

1. In Firebase console, go to **Project Settings** (gear icon ⚙️ top left)
2. Scroll down to **"Your apps"** section
3. Click your web app
4. Copy the `firebaseConfig` object

It looks like:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Paste it into the app
Open `src/services/firebase.js` and replace the placeholder values:

```js
// BEFORE (placeholders)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  // ...
};

// AFTER (your real values)
const firebaseConfig = {
  apiKey: "AIzaSy_your_actual_key_here",
  authDomain: "my-75hard.firebaseapp.com",
  projectId: "my-75hard",
  // ...
};
```

---

## 6. Running the App Locally

### Prerequisites
- Node.js v18+ installed ([https://nodejs.org](https://nodejs.org))
- A terminal / command prompt

### Steps

```bash
# 1. Navigate to the project folder
cd 75hard-tracker

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

You should see:
```
  VITE v5.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

### First-time experience:
1. You'll see the login page
2. Create an account (or sign in with Google)
3. Your dashboard will appear with all 75 days
4. Click any day to log your progress!

---

## 7. Firebase Hosting (Deployment)

Deploy your app so it's accessible from any device.

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```
(Opens browser to authenticate)

### Initialize Hosting
```bash
firebase init hosting
```
- Select your Firebase project
- Set public directory to: `dist`
- Configure as single-page app: **Yes**
- Don't overwrite `index.html`

### Build + Deploy
```bash
# Build the production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

Your app will be live at:
`https://YOUR_PROJECT_ID.web.app`

### For future updates:
```bash
npm run build && firebase deploy
```

---

## 8. Data Structure Explained

### Firestore Collections

```
Firestore Root
│
└── users/                          ← Collection
    └── {userId}/                   ← Document (one per user, ID = Firebase UID)
        ├── name: "Sameeraa"
        ├── email: "sameeraa@example.com"
        ├── createdAt: Timestamp
        │
        └── progress/               ← Subcollection
            ├── day_1/              ← Document
            │   ├── workout1: ["gym", "run"]
            │   ├── workout2: ["walk"]
            │   ├── water: 4
            │   ├── diet: true
            │   ├── reading: true
            │   ├── completed: true
            │   └── updatedAt: Timestamp
            │
            ├── day_2/
            │   └── ...
            │
            └── day_75/
                └── ...
```

### Why this structure?

| Decision | Reason |
|----------|--------|
| Subcollection for progress | Scales cleanly; each day is an independent document |
| `day_N` naming | Easy to fetch specific days; human-readable |
| `completed` flag | Computed on save, cached for fast dashboard rendering |
| `updatedAt` timestamp | Audit trail; helps with sync/conflict detection |

### Completion Logic

A day is marked `completed: true` ONLY when ALL of these are true:

```
workout1.length > 0   ← at least one workout 1 activity
workout2.length > 0   ← at least one workout 2 activity
water >= 4            ← at least 4 litres
diet === true         ← diet followed
reading === true      ← 10 pages read
```

This is computed in `DayModal.jsx` before saving.

---

## 9. Troubleshooting

### ❌ "Firebase: Error (auth/configuration-not-found)"
→ You haven't added your real Firebase config. Check `src/services/firebase.js`.

### ❌ "Firebase: Error (auth/unauthorized-domain)"
→ Add your domain to Firebase Auth → Settings → Authorized domains.
For local dev, `localhost` should already be there.

### ❌ Google Sign-in popup closes immediately
→ Make sure you set a "Project support email" in Authentication → Google → (click Edit pencil).

### ❌ Data not saving to Firestore
→ Check your security rules (Step 4). Make sure you're logged in and the rules allow writes.

### ❌ App shows blank white screen
→ Open browser DevTools (F12) → Console tab and look for errors. Usually a missing import or Firebase config issue.

### ❌ "npm install" fails
→ Make sure you're using Node.js 18+. Run `node --version` to check.

---

## 🎨 Customization Tips

### Change the color palette
Edit CSS variables in `src/styles/global.css`:
```css
:root {
  --lavender: #ede4f8;    ← change to any soft color
  --peach: #fde8d8;       ← accent color
  --mint: #d4f0e8;        ← success/complete color
}
```

### Change the water goal
In `DayModal.jsx`, update the condition:
```js
// Current: 4 litres required
water >= 4

// Change to 3 litres:
water >= 3
```

### Add more workout types
In `DayModal.jsx`, edit the `WORKOUT_OPTIONS` array:
```js
const WORKOUT_OPTIONS = [
  { id: 'gym',   label: 'Gym',   emoji: '🏋️' },
  { id: 'hiit',  label: 'HIIT',  emoji: '⚡' },  // ← new!
  // ...
];
```

---

## 📞 Support

If you get stuck, the most common fixes are:
1. Double-check your Firebase config keys
2. Ensure Auth methods are enabled in Firebase console
3. Check Firestore security rules

Good luck on your 75 Hard journey, Sameeraa! 💪🔥

---

*Built with React 18 + Firebase 10 + Claymorphic CSS*
