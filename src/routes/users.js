const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { createStudent, getAllUsers, refreshUserData, updateUserStatus, getUserById, updateUser, deleteUser } = require('../controllers/userController');

router.post('/create-student', protect, requireRole('admin'), createStudent);
router.get('/',                protect, requireRole('admin'), getAllUsers);
router.get('/refresh/:userId', protect, requireRole('admin'), refreshUserData);
router.put('/:userId/status', protect, requireRole('admin'), updateUserStatus);
router.delete('/:userId', protect, requireRole('admin'), deleteUser);
router.get('/:id',             protect, requireRole('admin'), getUserById);
router.put('/:id',             protect, updateUser);

module.exports = router;
