# Viewer Login Troubleshooting - Step by Step

## Quick Checklist - Check These First:

### 1. Is viewer@tmis.com user created in Authentication?
1. Go to Firebase Console → **Build** → **Authentication**
2. Click **"Users"** tab
3. Look for **viewer@tmis.com** in the list
   - ✓ If you see it → Go to next step
   - ✗ If NOT there → You need to CREATE IT (see "Missing Users" section below)

### 2. Does the Firestore document exist for viewer?
1. Go to Firebase Console → **Build** → **Firestore Database**
2. Click on **"users"** collection
3. You should see 3 documents:
   - One for admin
   - One for editor
   - One for viewer
4. Click on the **viewer document** (the one with viewer's UID)
5. Check if it has these fields:
   - `email`: viewer@tmis.com
   - `role`: viewer (exactly lowercase, no spaces)
   
   - ✓ If fields look correct → Go to next step
   - ✗ If fields are wrong or missing → See "Fix Document" section below

### 3. Are Security Rules published?
1. Go to Firebase Console → **Build** → **Firestore Database**
2. Click **"Rules"** tab (top)
3. Look for green checkmark or message saying **"Rules are in sync"**
   - ✓ If you see it → Rules are good
   - ✗ If red X or error → See "Fix Rules" section below

---

## If Viewer User is MISSING in Authentication:

### Create the Viewer User
1. Go to Firebase Console → **Build** → **Authentication**
2. Click **"Users"** tab
3. Click blue **"+ Create user"** button (top right)
4. A dialog appears:
   - **Email**: viewer@tmis.com
   - **Password**: password123
5. Click **"Create user"** ✓

---

## If Viewer Document is MISSING in Firestore:

### Create Viewer Document
1. Go to Firebase Console → **Build** → **Firestore Database**
2. Click on **"users"** collection
3. Click the **"+"** button to add new document
4. For Document ID:
   - Go back to **Authentication** → **Users**
   - Find **viewer@tmis.com**
   - Copy their **UID** (long string, click copy icon)
5. Go back to Firestore, paste the UID as Document ID
6. Click **"Next"**
7. Add fields:
   - **Field 1:**
     - Name: email
     - Type: String
     - Value: viewer@tmis.com
   - **Field 2:**
     - Name: role
     - Type: String
     - Value: viewer
8. Click **"Save"** ✓

---

## If Document Fields are WRONG:

### Fix the Viewer Document
1. Go to Firebase Console → **Build** → **Firestore Database**
2. Click on **"users"** collection
3. Click on the **viewer document**
4. Look at the fields:

**If `role` field says something other than "viewer":**
- Click on the field
- Click the **pencil icon** to edit
- Change it to: viewer (lowercase)
- Click checkmark to save

**If `role` field says "Viewer" (capital V):**
- WRONG! Should be "viewer" (lowercase)
- Click pencil icon to edit
- Delete and type: viewer (lowercase)
- Click checkmark to save

**If `role` field is missing:**
- Click **"+ Add field"**
- Name: role
- Type: String
- Value: viewer
- Click checkmark

---

## If Security Rules Have RED X:

### Publish the Rules
1. Go to Firebase Console → **Build** → **Firestore Database**
2. Click **"Rules"** tab
3. Look at the rules code
4. If there are red error lines:
   - Click the **"Publish"** button (top right, blue button)
   - A dialog asks "Publish these rules?"
   - Click **"Publish"**
5. Wait for message: **"Rules published successfully"** ✓

---

## After Fixing - Test Login Again

1. Go to **http://localhost:5173**
2. Close and reopen your browser (important!)
3. Try logging in:
   - Email: **viewer@tmis.com**
   - Password: **password123**
4. Should work now! ✓

---

## Still not working? Check the Browser Console:

1. Open your browser (Chrome, Firefox, etc.)
2. Press **F12** (or right-click → "Inspect")
3. Click **"Console"** tab
4. Look for any RED error messages
5. Copy the error message
6. Tell me what it says - that will help fix it!

---

## Common Mistakes:

❌ **Wrong:**
- Role = "Viewer" (capital V)
- Role = "viewer " (space after)
- Email = "viewer@tmis.com " (space after)
- Document ID is not the UID (it's a different ID)

✓ **Correct:**
- Role = "viewer" (lowercase, no spaces)
- Email = "viewer@tmis.com" (no spaces)
- Document ID = viewer's UID (from Authentication)

---

## Summary:

Did you do ALL of these?

- [ ] viewer@tmis.com exists in Authentication
- [ ] Viewer document exists in Firestore "users" collection
- [ ] Viewer document has UID as Document ID
- [ ] Viewer document has "email" field = "viewer@tmis.com"
- [ ] Viewer document has "role" field = "viewer" (lowercase)
- [ ] Security rules are published (green checkmark)
- [ ] Closed and reopened browser
- [ ] Try login again
