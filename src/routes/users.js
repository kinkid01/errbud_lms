const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { createStudent, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

router.post('/create-student', protect, requireRole('admin'), createStudent);
router.get('/',                protect, requireRole('admin'), getAllUsers);
router.get('/:id',             protect, requireRole('admin'), getUserById);
router.put('/:id',             protect, updateUser);
router.delete('/:id',          protect, requireRole('admin'), deleteUser);

module.exports = router;
