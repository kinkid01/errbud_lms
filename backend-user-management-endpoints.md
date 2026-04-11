# Backend User Management Endpoints

## 1. Update User Status Endpoint

```javascript
// PUT /api/users/:userId/status
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { isAccountActive } = req.body;
    const userId = req.params.userId;
    
    // Verify admin permissions
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update user status
    user.isAccountActive = isAccountActive;
    await user.save();
    
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        generatedPassword: user.generatedPassword,
        emailVerified: user.emailVerified,
        isAccountActive: user.isAccountActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status' 
    });
  }
});
```

## 2. Delete User Endpoint

```javascript
// DELETE /api/users/:userId
router.delete('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify admin permissions
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    // Find user first to get name for response
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Delete user (optional: also delete related data)
    await User.findByIdAndDelete(userId);
    
    res.json({
      success: true,
      message: `User ${user.name} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
});
```

## 3. Enhanced Change Password Endpoint (Update)

Make sure your existing `/auth/change-password` endpoint updates the `generatedPassword` field:

```javascript
// PUT /api/auth/change-password
router.put('/auth/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From JWT token
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update both password fields
    user.passwordHash = hashedPassword;
    user.generatedPassword = newPassword; // Plain text for admin visibility
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password' 
    });
  }
});
```

## 4. Route Registration

Make sure these routes are registered in your main routes file:

```javascript
// In your routes file (e.g., routes/users.js or server.js)
router.put('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);
router.put('/auth/change-password', changePassword); // Update existing
```

## 5. Testing with Postman/Insomnia

### Update User Status:
- **Method:** PUT
- **URL:** `{{base_url}}/api/users/{{user_id}}/status`
- **Headers:** `Authorization: Bearer {{admin_token}}`
- **Body:** 
```json
{
  "isAccountActive": false
}
```

### Delete User:
- **Method:** DELETE
- **URL:** `{{base_url}}/api/users/{{user_id}}`
- **Headers:** `Authorization: Bearer {{admin_token}}`

### Change Password:
- **Method:** PUT
- **URL:** `{{base_url}}/api/auth/change-password`
- **Headers:** `Authorization: Bearer {{user_token}}`
- **Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

## Security Notes

1. **Admin Verification:** All admin endpoints verify `req.user.role === 'admin'`
2. **Password Security:** `passwordHash` for auth, `generatedPassword` for admin visibility
3. **Error Handling:** Consistent error responses with proper HTTP status codes
4. **Data Validation:** Validate required fields before processing

Add these endpoints to your backend and the 3-dot menu will work perfectly!
