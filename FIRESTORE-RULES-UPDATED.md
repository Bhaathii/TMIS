# Updated Firestore Security Rules

Copy these rules to Firebase Console → Firestore → Rules and publish.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isUser(userId) {
      return request.auth.uid == userId;
    }

    function userRole(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role.lower().trim();
    }

    function isAdmin(userId) {
      return isSignedIn() && userRole(userId) == "admin";
    }

    function isEditor(userId) {
      return isSignedIn() && userRole(userId) == "editor";
    }

    // Users collection - everyone can read their own, admins can see all
    match /users/{userId} {
      allow read: if isSignedIn() && (isUser(userId) || isAdmin(request.auth.uid));
      allow write: if isSignedIn() && isAdmin(request.auth.uid);
    }

    // TMIS data - anyone logged in can read
    match /TMIS_Header/{document=**} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
      allow update: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
      allow delete: if isSignedIn() && isAdmin(request.auth.uid);
    }

    match /TMIS_Layers/{document=**} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
      allow update: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
      allow delete: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
    }

    match /TMIS_Processes/{document=**} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
      allow update: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
      allow delete: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
    }

    match /TMIS_Slitting/{document=**} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
      allow update: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
      allow delete: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
    }
  }
}
```

## Changes Made:
- Added `.lower()` to normalize case
- Added `.trim()` to remove whitespace
- Updated the `userRole()` function to handle both: `return get(...).data.role.lower().trim();`

## How to Apply:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your **tmis-db** project
3. Go to **Firestore Database** → **Rules** tab
4. Replace the entire rules content with the code above
5. Click **Publish**
6. Reload your app and try editing again
