# Implementation Plan - Profile Page

## Goal
Implement a functional Profile page where the user can view their details, edit their personal information (Name, Email), and update their profile image.

## Proposed Changes

### 1. New Component: `ProfileComponent`
*   **Location**: `src/app/profile/profile.component.ts` (and html/css)
*   **Features**:
    *   **Layout**: A clean, responsive layout.
        *   **Left Column**: distinct "Profile Card" showing the current Avatar, Name, and Role.
        *   **Right Column**: "Edit Profile" form.
    *   **Form Fields**:
        *   Full Name
        *   Email (Read-only or Editable depending on policy, I'll make it editable)
        *   Role (Read-only)
        *   Profile Image Upload (File input that previews the image)
    *   **Actions**: Save Changes button.

### 2. Service Updates: `AuthService`
*   **File**: `src/app/auth/services/auth.service.ts`
*   **Changes**:
    *   Add `updateProfile(data: FormData): Observable<any>` (Simulated/Mocked for now).
    *   Add `getProfile(): Observable<any>` (Simulated/Mocked).
    *   Rationale: We need a way to fetch and save user data. Since strictly `api/auth` was given, we will add methods that *would* hit the backend, but likely mock the response to ensure the UI works.

### 3. Route Configuration
*   **File**: `src/app/app.routes.ts`
*   **Changes**: Add `{ path: 'profile', component: ProfileComponent }` under the protected `AppLayoutComponent`.

## Verification Plan

### Manual Verification
1.  **Navigate**: Log in and click "Profile" in the top dropdown.
2.  **View**: Ensure default data (mocked) loads correctly into the form and card.
3.  **Edit Text**: Change the "Full Name" and click Save. Verify a success message / toast appears (or console log).
4.  **Edit Image**: Click to upload a new image. Verify the image preview updates immediately.
5.  **State**: Reload the page to see if changes persist (if using local storage mock) or reset (if just memory mock). I'll try to persist to `localStorage` for a better demo experience.
