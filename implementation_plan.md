# Google Login & Multi-device Sync Implementation Plan

To enable synchronization between devices (iPad, Android, etc.), we need to move the data storage from the device's local browser storage (`localStorage`) to a cloud database.

I propose using **Firebase** (by Google), which provides both Authentication (Google Login) and a Realtime Database (Firestore) in one package. It is free for small personal projects.

## User Action Required (Firebase Setup)
You will need to create a Firebase project. I cannot do this for you automatically.
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (e.g., "my-habit-tracker").
3. **Enable Authentication**:
   - Go to "Build" -> "Authentication" -> "Get Started".
   - Select "Google" as a Sign-in method and enable it.
4. **Enable Firestore Database**:
   - Go to "Build" -> "Firestore Database" -> "Create Database".
   - Start in **Test mode** (for easier development).
5. **Get Configuration**:
   - Go to Project Settings (gear icon) -> "General".
   - Scroll down to "Your apps" and click the `</>` (Web) icon.
   - Register the app (name it whatever you like).
   - **Copy the `firebaseConfig` object** (API keys, etc.).

## Proposed Changes

### 1. Install Dependencies
- Install `firebase` package.

### 2. Firebase Initialization
- Create `src/lib/firebase.ts`.
- Initialize Firebase app with the user-provided configuration.
- Export auth and db instances.

### 3. Authentication Flow (`App.tsx`)
- Add "Sign in with Google" button in the header or settings.
- Manage `user` state (logged in vs guest).
- **Data Migration**: When a user logs in for the first time, ask if they want to upload their current local data to the cloud.

### 4. Data Synchronization
- Modify `useEffect` hooks to subscribe to Firestore changes when logged in.
- **Schema**:
  - `users/{userId}/data/habits` (Store habits list)
  - `users/{userId}/data/records` (Store completion records)
  - `users/{userId}/data/settings` (Store theme/bg settings)

## Verification Plan
- **Manual Test**:
  1. Open app in Incognito window (simulating new device).
  2. Login with Google.
  3. Verify data from the main window appears.
  4. Check off a habit in one window, verify it updates in the other.
