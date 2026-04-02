# TMIS Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the setup wizard
3. Name: "TMIS" (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

#### Step 2: Enable Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Click **Save**

#### Step 3: Setup Firestore Database
1. In Firebase Console, go to **Build > Firestore Database**
2. Click **Create Database**
3. Select **Start in production mode**
4. Choose your database location (closest to your region)
5. Click **Create**

#### Step 4: Get Firebase Config
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click on the web app icon (</> )
4. Copy the firebaseConfig object

#### Step 5: Add Environment Variables
1. Rename `.env.example` to `.env.local`
2. Fill in your Firebase credentials from Step 4:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Create Demo Users in Firebase

#### Create Users
1. In **Firebase Console > Authentication > Users**
2. Click **Add user** for each demo account:

**Admin User:**
- Email: `admin@tmis.com`
- Password: `password123`

**Editor User:**
- Email: `editor@tmis.com`
- Password: `password123`

**Viewer User:**
- Email: `viewer@tmis.com`
- Password: `password123`

#### Set User Roles in Firestore
1. Go to **Firestore Database**
2. Create a new collection called `users`
3. For each user, create a document with their UID as the document ID:

**Document: users/{admin_uid}**
```json
{
  "email": "admin@tmis.com",
  "role": "admin"
}
```

**Document: users/{editor_uid}**
```json
{
  "email": "editor@tmis.com",
  "role": "editor"
}
```

**Document: users/{viewer_uid}**
```json
{
  "email": "viewer@tmis.com",
  "role": "viewer"
}
```

### 4. Setup Firestore Security Rules

In **Firestore Database > Rules**, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read own,admins can see all
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

### 5. Run Development Server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Running in Production

### Build
```bash
npm run build
```

Output files are in `dist/` folder.

### Deploy to Firebase Hosting (Optional)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Features

### Authentication & Authorization
- **Admin**: Full access (view, create, edit, delete)
- **Editor**: Can view, create, and edit (no delete)
- **Viewer**: Read-only access

### Main Table: TMIS_Header
- Tape Code (unique identifier)
- Issue Date
- Revision Number
- Status (Active/Obsolete)
- Additional Info & Comments

### Child Tables
- **Layers** (max 5): Specifications for each layer
- **Processes** (4 fixed: A, B, C, D): Manufacturing processes
- **Slitting** (max 3): Slitting specifications

### Screens
1. **Login**: Email/password authentication
2. **Browse**: Search and filter TMIS records
3. **Create/Edit**: Manage records and child tables
4. **View Detail**: Read-only record display

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Verify all environment variables in `.env.local` are correct
- Check that the API key is enabled in Firebase Console

### Users Can't Login
- Verify user exists in Firebase Authentication
- Check user document exists in `users` collection with correct role
- Verify password is correct

### Firestore Errors
- Check Firestore security rules are updated correctly
- Verify collections exist (`TMIS_Header`, `TMIS_Layers`, etc.)
- Check user has appropriate role in `users` collection

### Build Issues
- Clear `node_modules` and reinstall: `rm -r node_modules && npm install`
- Clear dist folder: `rm -r dist`
- Rebuild: `npm run build`

## Project Structure

```
TMIS/
├── src/
│   ├── pages/              # Page components
│   ├── components/         # Reusable UI components
│   ├── firebase/           # Firebase configuration
│   ├── utils/              # Utilities (auth, API calls)
│   ├── types/              # TypeScript definitions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── index.html              # HTML entry
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies
└── README.md               # Full documentation
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for fast development
- Firebase (Firestore + Auth)
- React Router for navigation
- React Hook Form for form handling

## Support

For issues or questions:
1. Check the README.md for full documentation
2. Review demo credentials for testing
3. Verify Firebase setup is complete
4. Check browser console for error messages

---

**Last Updated**: March 2024
**Version**: 1.0.0
