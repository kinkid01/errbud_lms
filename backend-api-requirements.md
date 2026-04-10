# Backend API Requirements for Password Sync

## New Endpoints Needed

### 1. Update User Password (Admin Sync)
```
PUT /users/{userId}/password
```

**Request Body:**
```json
{
  "password": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "generatedPassword": "newPassword123",
    "emailVerified": true,
    "isAccountActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Enhanced Refresh User Status (Already exists but needs enhancement)
```
GET /users/refresh/{userId}
```

**Response should include updated `generatedPassword` field if changed**

## Existing Endpoint Enhancement

### Change Password (Student Side)
```
PUT /auth/change-password
```

This endpoint should also update the `generatedPassword` field in the user document when a password is successfully changed.

## Database Schema Requirements

The User collection should have:
- `generatedPassword`: string (stores the current password for admin visibility)
- `passwordHash`: string (bcrypt hash for authentication)

## Implementation Notes

1. When student changes password via `/auth/change-password`, update both:
   - `passwordHash` (for authentication)
   - `generatedPassword` (for admin visibility)

2. The admin sync endpoint `/users/{userId}/password` should:
   - Validate admin permissions
   - Update the `generatedPassword` field
   - Return the updated user object

3. The refresh endpoint should always return the current state including the latest `generatedPassword`

## Security Considerations

- The `generatedPassword` field stores plain text passwords for admin visibility
- Only admin users should have access to see this field
- Consider implementing audit logging for password changes
- The plain text storage should be clearly documented as a security trade-off for admin visibility
