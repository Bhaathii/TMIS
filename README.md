# TMIS - Tape Management Information System

A professional, role-based web application for managing tape manufacturing information with Firebase integration. Built with React, TypeScript, and Tailwind CSS.

## Overview

TMIS is a comprehensive management system that enables organizations to:
- Store and manage tape manufacturing records with version control
- Organize tape specifications into a hierarchical structure (Layers, Processes, Slitting)
- Control access through three distinct user roles with granular permissions
- Search and filter records efficiently
- Maintain audit trails of all changes

## Features

### Authentication & Authorization
- **Three User Roles:**
  - **Admin**: Full access - can view, create, edit, and delete all records
  - **Editor**: Can view, create, and edit records, but cannot delete
  - **Viewer**: Read-only access to all records
- Firebase Authentication with role-based permissions
- Persistent session management

### Data Management

#### Main Table: TMIS_Header
- Issue Date (required)
- Revision Number (auto-incrementing, default 0)
- Status (Active/Obsolete)
- Tape Code (unique identifier, required)
- Additional Info (multiline text)
- TMIS Comments (multiline text)

#### Child Tables (1-to-Many Relationships):

**TMIS_Layers** (Maximum 5 per header)
- Layer Number (1-5)
- Layer Description
- Weight/Thickness specifications
- Item Code
- Notes and additional details

**TMIS_Processes** (4 fixed processes: A, B, C, D)
- Process Letter (A, B, C, or D)
- Machine Type
- Heat settings
- Speed
- Air Flow (AFlow)
- Press settings
- Setup Time
- Processing Time
- Cleaning Time
- Other parameters
- Detailed process description

**TMIS_Slitting** (Maximum 3 rows)
- Row Number (1-3)
- Processing method
- Processing Time
- Cleaning details

### Screens

1. **Login Page**
   - Professional authentication interface
   - Email and password login
   - Display of demo credentials

2. **Browse/Dashboard Screen**
   - Table view of all TMIS records
   - Search by Tape Code
   - Filter by Status (Active/Obsolete)
   - Role-based action visibility (Edit, Delete buttons hidden for non-authorized users)
   - Quick access to Create, View, Edit, and Delete operations

3. **Create/Edit Screen**
   - Header information form
   - Embedded, editable galleries for child tables
   - Add/Remove functionality for child records
   - Validation of maximum limits (5 layers, 4 processes, 3 slitting rows)
   - Responsive design for all screen sizes

4. **View/Detail Screen**
   - Read-only display of complete record information
   - Organized hierarchical view of all child records
   - Edit and Delete buttons (visible only for authorized users)
   - Professional typography and spacing

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Auth
- **Routing**: React Router v6
- **Forms**: React Hook Form

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── LayersGallery.tsx
│   ├── ProcessesGallery.tsx
│   └── SlittingGallery.tsx
├── pages/                # Page components
│   ├── LoginPage.tsx
│   ├── BrowsePage.tsx
│   ├── CreateEditPage.tsx
│   └── ViewDetailPage.tsx
├── firebase/             # Firebase configuration
│   └── config.ts
├── types/                # TypeScript type definitions
│   └── index.ts
├── utils/                # Utility functions
│   ├── AuthContext.tsx   # Authentication context
│   └── firebaseUtils.ts  # Firebase operations
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project (with Firestore and Authentication enabled)

### Steps

1. **Clone and Navigate**
   ```bash
   cd TMIS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Email/Password Authentication
   - Copy your Firebase credentials

4. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Firebase Database Setup**
   - Create users in Firebase Authentication with these demo accounts:
     ```
     Admin:    admin@tmis.com / password123
     Editor:   editor@tmis.com / password123
     Viewer:   viewer@tmis.com / password123
     ```
   - In Firestore, create a `users` collection with documents:
     ```
     users/{uid}
     {
       email: "email@tmis.com",
       role: "admin" | "editor" | "viewer"
     }
     ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```
   - Application opens at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

Output files are in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Database Schema

### Collections in Firestore

**Users**
```javascript
{
  uid: string,
  email: string,
  displayName?: string,
  role: 'admin' | 'editor' | 'viewer',
  createdAt: timestamp
}
```

**TMIS_Header**
```javascript
{
  TMISIssueDate: date,
  RevNo: number,
  Status: 'Active' | 'Obsolete',
  TapeCode: string,
  AdditionalInfo?: string,
  TMISComments?: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string
}
```

**TMIS_Layers**
```javascript
{
  headerId: string,
  LayerNo: number,
  LayerDescription: string,
  WeightOrThickness?: string,
  ItemCode?: string,
  Note?: string
}
```

**TMIS_Processes**
```javascript
{
  headerId: string,
  ProcessLetter: 'A' | 'B' | 'C' | 'D',
  MachineType?: string,
  Heat?: number,
  Speed?: number,
  AFlow?: string,
  Press?: number,
  SetupTime?: string | number,
  ProcessingTime?: string | number,
  CleaningTime?: string | number,
  Other?: string,
  DescribeProcess?: string
}
```

**TMIS_Slitting**
```javascript
{
  headerId: string,
  RowNo: number,
  Processing?: string,
  ProcessingTime?: string | number,
  Cleaning?: string
}
```

## Permissions Matrix

| Action | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| View Records | ✓ | ✓ | ✓ |
| Create Records | ✓ | ✓ | ✗ |
| Edit Records | ✓ | ✓ | ✗ |
| Delete Records | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ |

## Design Highlights

- **Professional UI**: Clean, modern interface following current web design standards
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Role-based UI adaptation - users only see options they can use
- **Consistent Styling**: Tailwind CSS ensures visual consistency across all screens
- **Accessibility**: Semantic HTML and ARIA labels for better accessibility
- **Performance**: Optimized component rendering and lazy loading

## Demo Credentials

For testing purposes, use these credentials:

```
Admin Account:
  Email: admin@tmis.com
  Password: password123

Editor Account:
  Email: editor@tmis.com
  Password: password123

Viewer Account:
  Email: viewer@tmis.com
  Password: password123
```

## Troubleshooting

### Firebase Configuration Issues
- Verify all environment variables are correctly set in `.env.local`
- Ensure Firebase Firestore rules allow read/write for authenticated users
- Check that Firebase project has Authentication enabled

### Login Issues
- Verify user exists in Firebase Authentication
- Check user has a corresponding document in the `users` collection with correct role
- Ensure password is correct

### Performance Issues
- Clear browser cache and rebuild
- Check Firebase quota and limits
- Optimize image sizes if applicable

## Future Enhancements

- User management dashboard (Admin only)
- Bulk import/export functionality
- Advanced reporting and analytics
- Real-time collaboration features
- File attachment support
- Audit log viewer
- Custom field definitions
- Workflow approvals

## License

This project is proprietary and confidential.

## Support

For issues or questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: March 2024
