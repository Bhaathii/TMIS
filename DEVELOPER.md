# TMIS Developer Documentation

## Authentication API

### AuthContext Hook
```typescript
const { currentUser, loading, error, login, logout, isAdmin, isEditor, isViewer, canEdit, canDelete } = useAuth();
```

**Properties:**
- `currentUser`: Current user object or null
- `loading`: Boolean indicating auth state is loading
- `error`: Error message if any

**Methods:**
- `login(email: string, password: string)`: Sign in user
- `logout()`: Sign out user
- `isAdmin()`: Check if user is admin
- `isEditor()`: Check if user is editor
- `isViewer()`: Check if user is viewer
- `canEdit()`: Check if user can edit (admin or editor)
- `canDelete()`: Check if user can delete (admin only)

## Database API

### TMIS Header Operations

**Add Header**
```typescript
const headerId = await addTMISHeader({
  TMISIssueDate: new Date(),
  RevNo: 0,
  Status: 'Active',
  TapeCode: 'TC-001',
  AdditionalInfo: 'Info...',
  TMISComments: 'Comments...',
  createdBy: userId
});
```

**Get Header**
```typescript
const header = await getTMISHeader(headerId);
```

**Get All Headers**
```typescript
const headers = await getAllTMISHeaders();
```

**Search by Tape Code**
```typescript
const results = await searchTMISByTapeCode('TC');
```

**Filter by Status**
```typescript
const active = await filterTMISByStatus('Active');
const obsolete = await filterTMISByStatus('Obsolete');
```

**Update Header**
```typescript
await updateTMISHeader(headerId, {
  RevNo: 1,
  Status: 'Obsolete'
});
```

**Delete Header**
```typescript
await deleteTMISHeader(headerId);
// Also deletes all child records
```

### TMIS Layers Operations

**Add Layer**
```typescript
const layerId = await addTMISLayer({
  headerId: 'header-id',
  LayerNo: 1,
  LayerDescription: 'Base layer',
  WeightOrThickness: '50µm',
  ItemCode: 'ITEM-001',
  Note: 'Notes here'
});
```

**Get Layers**
```typescript
const layers = await getLayersByHeaderId(headerId);
```

**Update Layer**
```typescript
await updateTMISLayer(layerId, {
  LayerDescription: 'Updated description'
});
```

**Delete Layer**
```typescript
await deleteTMISLayer(layerId);
```

### TMIS Processes Operations

**Add Process**
```typescript
const processId = await addTMISProcess({
  headerId: 'header-id',
  ProcessLetter: 'A',
  MachineType: 'Machine X',
  Heat: 200,
  Speed: 50,
  AFlow: 'Normal',
  Press: 100,
  SetupTime: '30min',
  ProcessingTime: '2h',
  CleaningTime: '15min',
  Other: 'Other info',
  DescribeProcess: 'Process description'
});
```

**Get Processes**
```typescript
const processes = await getProcessesByHeaderId(headerId);
```

**Update Process**
```typescript
await updateTMISProcess(processId, {
  Heat: 220,
  Speed: 55
});
```

**Delete Process**
```typescript
await deleteTMISProcess(processId);
```

### TMIS Slitting Operations

**Add Slitting**
```typescript
const slittingId = await addTMISSlitting({
  headerId: 'header-id',
  RowNo: 1,
  Processing: 'Slitting method',
  ProcessingTime: '1.5h',
  Cleaning: 'Cleaning procedure'
});
```

**Get Slittings**
```typescript
const slittings = await getSlittingsByHeaderId(headerId);
```

**Update Slitting**
```typescript
await updateTMISSlitting(slittingId, {
  Processing: 'Updated method'
});
```

**Delete Slitting**
```typescript
await deleteTMISSlitting(slittingId);
```

## Component API

### LayersGallery

```typescript
<LayersGallery
  layers={layers}
  isEditable={true}
  onAdd={handleAddLayer}
  onUpdate={(index, layer) => handleUpdateLayer(index, layer)}
  onDelete={(index) => handleDeleteLayer(index)}
  maxLayers={5}
/>
```

### ProcessesGallery

```typescript
<ProcessesGallery
  processes={processes}
  isEditable={true}
  onAdd={handleAddProcess}
  onUpdate={(index, process) => handleUpdateProcess(index, process)}
  onDelete={(index) => handleDeleteProcess(index)}
/>
```

### SlittingGallery

```typescript
<SlittingGallery
  slittings={slittings}
  isEditable={true}
  onAdd={handleAddSlitting}
  onUpdate={(index, slitting) => handleUpdateSlitting(index, slitting)}
  onDelete={(index) => handleDeleteSlitting(index)}
  maxSlittings={3}
/>
```

## Type Definitions

### User
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
}
```

### TMISHeader
```typescript
interface TMISHeader {
  id: string;
  TMISIssueDate: Date;
  RevNo: number;
  Status: 'Active' | 'Obsolete';
  TapeCode: string;
  AdditionalInfo?: string;
  TMISComments?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### TMISLayer
```typescript
interface TMISLayer {
  id: string;
  headerId: string;
  LayerNo: number;
  LayerDescription: string;
  WeightOrThickness?: string;
  ItemCode?: string;
  Note?: string;
}
```

### TMISProcess
```typescript
interface TMISProcess {
  id: string;
  headerId: string;
  ProcessLetter: 'A' | 'B' | 'C' | 'D';
  MachineType?: string;
  Heat?: number;
  Speed?: number;
  AFlow?: string;
  Press?: number;
  SetupTime?: string | number;
  ProcessingTime?: string | number;
  CleaningTime?: string | number;
  Other?: string;
  DescribeProcess?: string;
}
```

### TMISSlitting
```typescript
interface TMISSlitting {
  id: string;
  headerId: string;
  RowNo: number;
  Processing?: string;
  ProcessingTime?: string | number;
  Cleaning?: string;
}
```

## Routing

The application uses React Router with these routes:

```
/                    → Redirects to /dashboard if authenticated, /login otherwise
/login               → Login page (public)
/dashboard           → Browse/list view (protected)
/create              → Create new record (protected, requires edit permission)
/edit/:id            → Edit existing record (protected, requires edit permission)
/view/:id            → View record details (protected)
```

Protected routes redirect to login if not authenticated.

## Styling

The application uses Tailwind CSS with custom primary colors. Modify in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#f0f7ff',
    100: '#e0efff',
    200: '#bae6ff',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },
}
```

Common Tailwind utilities used:
- `bg-primary-600`: Primary button background
- `text-primary-600`: Primary text color
- `hover:bg-primary-700`: Hover state
- `focus:ring-2 focus:ring-primary-500`: Focus state

## Firebase Integration

### Configuration
Firebase config is in `src/firebase/config.ts`. Environment variables are loaded from `.env.local`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

### Database Structure
- **Collection**: `users`
  - Documents represent user roles and metadata

- **Collection**: `TMIS_Header`
  - Main records for tape specifications
  - Fields: TMISIssueDate, RevNo, Status, TapeCode, etc.

- **Collection**: `TMIS_Layers`
  - Child records of headers (max 5 per header)
  - Linked via `headerId` field

- **Collection**: `TMIS_Processes`
  - Child records of headers (4 processes: A, B, C, D)
  - Linked via `headerId` field

- **Collection**: `TMIS_Slitting`
  - Child records of headers (max 3 per header)
  - Linked via `headerId` field

## Common Development Tasks

### Adding a New Field to TMISHeader

1. Update the interface in `src/types/index.ts`
2. Add form field in `CreateEditPage.tsx`
3. Update Firestore security rules if needed
4. Update form display in `ViewDetailPage.tsx`

### Customizing the Login Page

Edit `src/pages/LoginPage.tsx` to modify:
- Logo/branding
- Color scheme
- Demo credentials display
- Form validation

### Adding a New User Role

1. Update `UserRole` type in `src/types/index.ts`
2. Add role checks in `AuthContext.tsx`
3. Create new methods like `isCustomRole()`
4. Update security rules in Firebase
5. Conditionally show UI based on role

### Extending Permissions

In `AuthContext.tsx`, add new permission methods:

```typescript
const canArchive = () => currentUser?.role === 'admin' || currentUser?.role === 'editor';
```

Then use in components:

```typescript
{canArchive() && <button>Archive</button>}
```

## Performance Tips

1. Use lazy loading for child galleries
2. Implement pagination for large result sets
3. Consider indexing frequently searched fields in Firestore
4. Use code splitting with dynamic imports for routes
5. Optimize component re-renders with React.memo

## Testing

Example test for authentication:

```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import App from './App';

test('renders login page when not authenticated', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});
```

## Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
npm run build
vercel deploy
```

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Security Considerations

1. Never commit `.env.local` with real credentials
2. Keep Firebase security rules strict
3. Validate user permissions on both frontend and backend
4. Use HTTPS in production
5. Implement rate limiting for API calls
6. Regularly audit user access logs
7. Use strong passwords for admin accounts

## Troubleshooting

### Hot Module Replacement (HMR) Not Working
Clear browser cache and restart dev server:
```bash
npm run dev
```

### Tailwind Styles Not Applying
Rebuild with:
```bash
npm run build
```

### TypeScript Errors
Run type check:
```bash
npx tsc --noEmit
```

---

**Last Updated**: March 2024
**Version**: 1.0.0
