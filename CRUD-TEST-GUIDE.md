# TMIS CRUD Operations Testing Guide

## Test Setup
- Demo users available:
  - **Admin**: admin@tmis.com / password123
  - **Editor**: editor@tmis.com / password123
  - **Viewer**: viewer@tmis.com / password123

---

## 1. CREATE Operations ✓

### Admin - CREATE
- [ ] **Login as admin@tmis.com**
- [ ] Click **"+ New Record"** button
- [ ] Fill in:
  - Tape Code: `TEST-001`
  - Issue Date: Select any date
  - Revision No: `1`
  - Status: `Active`
  - Additional Info: `Test record`
  - TMIS Comments: `Created for testing`
- [ ] Add at least 1 Layer (name: `Layer1`)
- [ ] Add at least 1 Process (letter: `A`)
- [ ] Add at least 1 Slitting (row: `1`)
- [ ] Click **Save**
- [ ] Expected: Record created successfully, redirected to dashboard
- [ ] Verify: Record appears in the table with correct date

### Editor - CREATE
- [ ] **Logout, login as editor@tmis.com**
- [ ] Click **"+ New Record"** button
- [ ] Fill in similar data (e.g., `EDIT-001`)
- [ ] Add child records
- [ ] Click **Save**
- [ ] Expected: Record created successfully, redirected to dashboard

### Viewer - CREATE (Should FAIL)
- [ ] **Logout, login as viewer@tmis.com**
- [ ] Go to dashboard
- [ ] Expected: **NO "New Record" button** visible
- [ ] Expected: Cannot access `/create` route (redirects to dashboard)

---

## 2. READ Operations ✓

### Everyone - READ
- [ ] **Login as any role** (admin/editor/viewer)
- [ ] Dashboard shows records in table
- [ ] Expected: All users can see all records in the browse/dashboard page
- [ ] Click **View** button on any record
- [ ] Expected: Record detail page opens showing:
  - Tape Code
  - Issue Date (formatted correctly, not "Invalid Date")
  - Revision No
  - Status
  - Additional Info
  - TMIS Comments
  - All Layers with details
  - All Processes with details
  - All Slittings with details

### Search Functionality
- [ ] Enter tape code in search box (e.g., `TEST` or `EDIT`)
- [ ] Expected: Records filtered by tape code
- [ ] Clear search
- [ ] Filter by Status: `Active`
- [ ] Expected: Only active records shown
- [ ] Filter by Status: `Obsolete`
- [ ] Expected: Only obsolete records shown (if any)

---

## 3. UPDATE Operations ✓

### Admin - UPDATE FULL
- [ ] **Login as admin@tmis.com**
- [ ] Find and click **Edit** on a record (e.g., `TEST-001`)
- [ ] Modify:
  - Tape Code: `TEST-001-UPDATED`
  - Issue Date: Change to different date
  - Revision No: Increment to `2`
  - Status: Toggle to `Obsolete`
  - Additional Info: Add/modify text
  - TMIS Comments: Add/modify text
- [ ] Modify one Layer: Update `LayerDescription`
- [ ] Add a new Layer
- [ ] Click **Save**
- [ ] Expected: Update successful, redirected to dashboard
- [ ] Verify: Record reflects all changes
- [ ] Verify: Date displays correctly (not "Invalid Date")

### Editor - UPDATE (Own Records)
- [ ] **Logout, login as editor@tmis.com**
- [ ] Find a record created by editor (e.g., `EDIT-001`)
- [ ] Click **Edit**
- [ ] Modify some fields
- [ ] Add/modify child records
- [ ] Click **Save**
- [ ] Expected: Update successful

### Editor - UPDATE Admin Records
- [ ] Find a record created by admin (e.g., `TEST-001`)
- [ ] Click **Edit**
- [ ] Modify fields
- [ ] Click **Save**
- [ ] Expected: Update successful (editors can edit any record)

### Viewer - UPDATE (Should FAIL)
- [ ] **Logout, login as viewer@tmis.com**
- [ ] Dashboard shows records
- [ ] Expected: **NO "Edit" button** visible in Actions column
- [ ] Try accessing edit URL directly: `/edit/[recordId]`
- [ ] Expected: Access denied, redirect to dashboard

---

## 4. DELETE Operations ✓

### Admin - DELETE
- [ ] **Login as admin@tmis.com**
- [ ] Find a test record
- [ ] Expected: **"Delete" button** visible in Actions column
- [ ] Click **Delete**
- [ ] Expected: Confirmation dialog appears
- [ ] Click **OK** to confirm
- [ ] Expected: Record deleted from database
- [ ] Verify: Record no longer appears in dashboard

### Editor - DELETE (Should FAIL)
- [ ] **Logout, login as editor@tmis.com**
- [ ] Find any record
- [ ] Expected: **NO "Delete" button** visible
- [ ] Editors can create/edit but NOT delete

### Viewer - DELETE (Should FAIL)
- [ ] **Logout, login as viewer@tmis.com**
- [ ] Find any record
- [ ] Expected: **NO "Delete" button** visible
- [ ] Only View button available

---

## 5. Permission Matrix ✓

| Operation | Admin | Editor | Viewer |
|-----------|-------|--------|--------|
| View Records | ✓ | ✓ | ✓ |
| Create Record | ✓ | ✓ | ✗ |
| Edit Record | ✓ | ✓ | ✗ |
| Delete Record | ✓ | ✗ | ✗ |
| View Detail | ✓ | ✓ | ✓ |
| Add Layers | ✓ | ✓ | ✗ |
| Add Processes | ✓ | ✓ | ✗ |
| Add Slittings | ✓ | ✓ | ✗ |

---

## 6. Date Handling ✓

- [ ] Create record with date: `03/31/2026`
- [ ] Save and view record
- [ ] Expected: Date displays as `3/31/2026` (not "Invalid Date")
- [ ] Edit record and change date
- [ ] Save and view
- [ ] Expected: New date displays correctly

---

## 7. Child Records Management ✓

### Add Child Records
- [ ] In Create/Edit page, add multiple Layers (max 5)
- [ ] Add all 4 Processes (A, B, C, D)
- [ ] Add multiple Slittings (max 3)
- [ ] Save and verify all appear when viewing

### Edit Child Records
- [ ] Edit a Layer description
- [ ] Save and verify change persists
- [ ] Edit a Process detail
- [ ] Save and verify change persists

### Delete Child Records
- [ ] Remove a Layer
- [ ] Save and verify it's deleted
- [ ] Remove a Slitting
- [ ] Save and verify it's deleted

---

## 8. Known Working Features

✓ Authentication (Email/Password with 3 roles)
✓ Auto-create user documents with role assignment
✓ Role-based permission checks
✓ Firestore CRUD operations
✓ Child table management (Layers, Processes, Slittings)
✓ Search by Tape Code
✓ Filter by Status
✓ Date formatting
✓ Security rules (Firestore)
✓ Query optimization (no composite index errors)

---

## Troubleshooting

### Issue: "Missing or insufficient permissions" error
   → Check Firestore Security Rules have been updated with `.trim()` and `.lower()` fixes

### Issue: "Invalid Date" displayed
   → Likely a timestamp conversion issue - ensure Firestore converter is working

### Issue: Edit button not showing for editor
   → Check user document exists in Firestore with `role: "editor"`
   → Try logging out and logging back in to refresh role

### Issue: Child records not saving
   → Ensure all required fields are filled in (LayerNo, ProcessLetter, RowNo)
   → Check browser console for specific error messages

---

## Test Completion Checklist

- [ ] All CREATE operations working for authorized roles
- [ ] All READ operations working for all roles
- [ ] All UPDATE operations working for authorized roles
- [ ] All DELETE operations working for admin only
- [ ] Dates displaying correctly (no "Invalid Date")
- [ ] Child records (Layers/Processes/Slittings) working
- [ ] Search and filter functionality working
- [ ] Role-based UI correctly showing/hiding buttons
- [ ] Permission denials working correctly
