# Walkthrough - Profile Page Implementation

Refactored the application to include a user profile management page.

## Changes

### 1. New Profile Component
**Location**: `src/app/profile/`
*   **Split Layout**:
    *   **Left**: Profile Summary (Avatar, Name, Role, Stats) with Image Upload trigger.
    *   **Right**: Edit Form (Full Name, Email).
*   **Features**:
    *   **Image Preview**: Immediately shows the selected image before saving.
    *   **Form Validation**: Requires Full Name and Valid Email.
    *   **Feedback**: Success/Error alerts and Loading spinners.

### 2. Auth Service Updates
**Location**: `src/app/auth/services/auth.service.ts`
*   **`getProfile()`**: Simulates fetching user data (default + local storage).
*   **`updateProfile(data)`**: Simulates saving data to local storage for persistence during the session.

### 3. Routing
*   **Route**: `/profile` is now a protected route under the main app layout.
*   **Access**: Accessible via the User Dropdown in the header.

## Verification
1.  **Login** to the application.
2.  Click the **User Avatar** in the top right.
3.  Select **Profile**.
4.  **Edit** your name or email and click **Save**.
5.  **Change Photo** by clicking the camera icon.
