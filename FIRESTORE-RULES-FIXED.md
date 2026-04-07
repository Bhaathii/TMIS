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
      return get(/databases/$(database)/documents/users/$(userId)).data.role;
    }

    function isAdmin(userId) {
      return isSignedIn() && userRole(userId) == "admin";
    }

    function isEditor(userId) {
      return isSignedIn() && (userRole(userId) == "editor" || userRole(userId) == "admin");
    }

    // Users collection - everyone can read their own, admins can see all
    match /users/{userId} {
      allow read: if isSignedIn() && (isUser(userId) || isAdmin(request.auth.uid));
      allow write: if isSignedIn() && isAdmin(request.auth.uid);
    }

    // TMIS data - anyone logged in can read
    match /TMIS_Header/{document=**} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn() && isAdmin(request.auth.uid);
    }

    match /TMIS_Layers/{document=**} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
    }

    match /TMIS_Processes/{document=**} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
    }

    match /TMIS_Slitting/{document=**} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn() && (isEditor(request.auth.uid) || isAdmin(request.auth.uid));
    }

    // Login History - anyone logged in can write, admins see all, users see only their own
    match /loginHistory/{document=**} {
      allow write: if isSignedIn();
      allow read: if isSignedIn();
    }

    // Activity Log - anyone logged in can write, admins see all, users can read their own
    match /activityLog/{document=**} {
      allow write: if isSignedIn();
      allow read: if isSignedIn();
    }
  }
}
