# Firebase Cloud Functions - qsmsmobile

This directory contains Firebase Cloud Functions for syncing user deletions between Firebase Auth and your backend database.

## Functions

### `onUserDeleted`
Automatically triggers when a user is deleted from Firebase Auth. It calls your backend API to sync the deletion.

### `manualSyncDelete`
HTTP endpoint for manually triggering user deletion sync (for testing/admin purposes).

## Setup Instructions

### 1. Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Install dependencies
```bash
cd functions
npm install
```

### 4. Configure your backend API endpoint

Edit `src/config.ts` and replace the placeholder values:

```typescript
export const config = {
  deleteUserEndpoint: "https://your-backend.com/api/delete-user",
  adminKey: "your-secret-admin-key",
};
```

Or use environment variables (recommended for production):
```bash
# Set environment config
firebase functions:config:set backend.delete_url="https://your-api.com/delete-user"
firebase functions:config:set backend.admin_key="your-secret-key"
```

### 5. Build and Deploy
```bash
npm run build
npm run deploy
```

## Backend API Requirements

Your backend delete endpoint should:

1. Accept POST requests with JSON body:
```json
{
  "firebaseUid": "abc123...",
  "email": "user@example.com",
  "phone": "+1234567890",
  "displayName": "John Doe",
  "deletedAt": "2025-12-21T10:30:00.000Z"
}
```

2. Validate the `X-Admin-Key` header for security

3. Either:
   - **Soft delete**: Set `status = 'deleted'` and `deleted_at = NOW()`
   - **Hard delete**: Remove the user record entirely

4. Return a JSON response:
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

## Testing Locally

```bash
# Start Firebase emulators
npm run serve

# The function will trigger when you delete a user in the Auth emulator
```

## Monitoring

View function logs:
```bash
npm run logs
# or
firebase functions:log
```

## Troubleshooting

### Function not triggering
- Ensure the function is deployed: `firebase deploy --only functions`
- Check if user deletion is happening in the correct Firebase project

### Backend not receiving requests
- Verify the endpoint URL is correct in `config.ts`
- Check your backend logs for incoming requests
- Ensure your backend allows requests from Firebase's IP ranges

### Authentication errors
- Verify the admin key matches between function and backend
- Check the `X-Admin-Key` header is being sent and validated
