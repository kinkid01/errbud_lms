const User = require('../models/User');
const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailServiceAPI');

// Generate a random 8-character password (no ambiguous chars)
function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// POST /api/users/create-student  (admin only)
const createStudent = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A student with this email already exists' });
    }

    const generatedPassword = generatePassword();

    // Generate verification token and expiration
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password: generatedPassword,
      role: 'student',
      generatedPassword, // stored in plain text so admin can retrieve it
      emailVerified: false,
      isAccountActive: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    try {
      const emailSent = await sendVerificationEmail(user, generatedPassword);
      if (!emailSent) {
        console.error(`Failed to send verification email to ${user.email}`);
        // Still return success but log the error
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Still return success but log the error
    }

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        generatedPassword,
        emailVerified: user.emailVerified,
        isAccountActive: user.isAccountActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users  (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refresh user data (for admin dashboard)
const refreshUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        generatedPassword: user.generatedPassword,
        emailVerified: user.emailVerified,
        isAccountActive: user.isAccountActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user password (admin only)
const updateUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update the generatedPassword field (plain text for admin visibility)
    user.generatedPassword = password;
    await user.save();
    
    res.status(200).json({
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
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

// GET /api/users/:id  (admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/:id  (owner or admin)
const updateUser = async (req, res) => {
  try {
    if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not allowed to update another user' });
    }
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/users/:id  (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStudent,
  getAllUsers,
  refreshUserData,
  updateUserPassword,
  getUserById,
  updateUser,
  deleteUser,
};
