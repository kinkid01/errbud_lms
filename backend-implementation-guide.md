# Backend Implementation Guide - Password Sync

## 1. Update User Password Endpoint

Create this endpoint in your backend routes:

```javascript
// PUT /api/users/:userId/password
router.put('/users/:userId/password', async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.userId;
    
    // Verify admin permissions
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update the generatedPassword field (plain text for admin visibility)
    user.generatedPassword = password;
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
      message: 'Failed to update password' 
    });
  }
});
```

## 2. Enhance Change Password Endpoint

Update your existing change password endpoint:

```javascript
// PUT /api/auth/change-password
router.put('/auth/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Assuming authenticated user
    
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

## 3. Ensure Refresh User Endpoint Returns Password

Make sure your existing refresh endpoint includes the generatedPassword:

```javascript
// GET /api/users/refresh/:userId
router.get('/users/refresh/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify admin permissions
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        generatedPassword: user.generatedPassword, // Important!
        emailVerified: user.emailVerified,
        isAccountActive: user.isAccountActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh user data' 
    });
  }
});
```

## 4. Database Schema Updates

Make sure your User model includes these fields:

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // For authentication
  generatedPassword: { type: String }, // Plain text for admin visibility
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  emailVerified: { type: Boolean, default: false },
  isAccountActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});
```

## 5. Import Required Dependencies

At the top of your route file:

```javascript
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust path as needed
```

## Testing Order

1. First implement the database schema update
2. Then add the PUT `/users/:userId/password` endpoint
3. Update the existing change-password endpoint
4. Verify the refresh endpoint returns generatedPassword
5. Test with Postman/Insomnia:
   - Change password as student
   - Check admin refresh endpoint shows updated password

Once your backend is working with these endpoints, then we can activate the frontend changes!
