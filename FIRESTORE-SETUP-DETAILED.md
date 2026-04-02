# Firestore Setup - Step by Step Guide

## STEP 1: Go to Firebase Console

1. Open your browser and go to: **https://console.firebase.google.com**
2. You will see your projects list
3. Click on your **"tmis-db"** project

---

## STEP 2: Create Firestore Database

### 2.1 Navigate to Firestore
1. On the left side menu, click **"Build"** (expand it)
2. Under Build, click **"Firestore Database"**
3. You should see a blue button that says **"Create Database"**
4. Click it

### 2.2 Configure Database
A dialog will pop up with questions:

**Question 1: Security Rules**
- Select: **"Start in production mode"**
- Click **"Next"**

**Question 2: Location**
- Choose the location closest to you (e.g., "us-central1" for USA)
- Click **"Enable"**

Your database is now created! ✓

---

## STEP 3: Create "users" Collection

### 3.1 Create Collection
1. You should now see an empty Firestore database
2. Look for a button that says **"Start collection"** or **"+ Add Collection"**
3. Click it
4. A dialog appears asking for collection name
5. Type: **users** (exactly)
6. Click **"Next"**

### 3.2 Add First Document
A new dialog appears asking for document ID:

**Quick Option:**
- Click **"Auto-generate ID"** button
- Click **"Save"**

A new dialog appears with fields:
- You'll see a field name box on the left
- Click **"+ Add field"** or similar

---

## STEP 4: Get User UIDs and Create Documents

### 4.1 Find First User's UID
1. Go back to left menu → **"Build"** → **"Authentication"**
2. Click **"Users"** tab
3. You'll see your created users (admin@tmis.com, editor@tmis.com, viewer@tmis.com)
4. Copy the **UID** (User ID) of the first user (Admin)
   - Click on the user row
   - You'll see a popup with their UID (long string)
   - Click the copy icon next to it

### 4.2 Go Back to Firestore and Create Admin Document
1. Go back to **"Firestore Database"** (left menu → Build → Firestore Database)
2. You should see the "users" collection
3. Click on it to see the one Auto-generated document (or create new)
4. Click the **"+"** button to add a new document
5. Paste the UID as the **Document ID**
6. Click **"Next"**

### 4.3 Add Admin Fields
Now you'll add the role fields:

**First Field:**
- Field name (left box): **email**
- Type: **String** (select from dropdown)
- Value: **admin@tmis.com**
- Click **"+ Add field"**

**Second Field:**
- Field name: **role**
- Type: **String**
- Value: **admin**
- Click **"Save"**

✓ Admin user document created!

---

## STEP 5: Create Editor and Viewer Documents

### 5.1 For Editor User
1. Go back to **Authentication** → **Users**
2. Find **editor@tmis.com** user
3. Copy their UID
4. Go back to **Firestore Database** → **users** collection
5. Click **"+"** to add new document
6. Paste the UID as Document ID
7. Add fields:
   - **email**: editor@tmis.com
   - **role**: editor
8. Save ✓

### 5.2 For Viewer User
1. Go back to **Authentication** → **Users**
2. Find **viewer@tmis.com** user
3. Copy their UID
4. Go back to **Firestore Database** → **users** collection
5. Click **"+"** to add new document
6. Paste the UID as Document ID
7. Add fields:
   - **email**: viewer@tmis.com
   - **role**: viewer
8. Save ✓

---

## STEP 6: Update Security Rules

### 6.1 Navigate to Rules
1. In **Firestore Database**, click the **"Rules"** tab (top of the page)
2. You'll see some code that looks like:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 6.2 Replace All Code
1. Select ALL the text (Ctrl+A)
2. Delete it
3. Paste this new code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read own, admins can see all
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if isAdmin();
    }

    // TMIS data - authenticated users can read, authorized can write/delete
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
      allow delete: if request.auth != null && isAdmin();
    }
  }

  function isAdmin() {
    return request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
  }

  function isEditor() {
    return request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor";
  }
}
```

### 6.3 Publish Rules
1. Click the **"Publish"** button (top right, usually blue)
2. A dialog appears asking "Publish rules?"
3. Click **"Publish"**
4. Wait for it to say "Rules published successfully" ✓

---

## STEP 7: Test Your Setup

1. Go to **http://localhost:5173** (your app)
2. You should see a login page
3. Try logging in with:
   - Email: **admin@tmis.com**
   - Password: **password123**
4. If it works, you're done! ✓

---

## Troubleshooting

### Login doesn't work?
- Make sure user exists in Authentication
- Make sure user document exists in "users" collection with correct UID
- Make sure role is exactly: "admin", "editor", or "viewer" (lowercase)
- Check browser console for error messages (F12 → Console)

### Can't see collections?
- Go to Firestore Database
- Wait a few seconds
- Refresh the page

### Rules show red errors?
- Make sure there are no typos in the rules code
- Check the error message and fix it
- Try publishing again

---

**Summary Checklist:**

- [ ] Firestore Database created
- [ ] "users" collection created
- [ ] Admin user document created (with UID, email, role)
- [ ] Editor user document created (with UID, email, role)
- [ ] Viewer user document created (with UID, email, role)
- [ ] Security rules updated and published
- [ ] Login test successful
