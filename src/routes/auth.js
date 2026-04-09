const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, sendVerificationEmail, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login',                    login);
router.post('/send-verification-email',    sendVerificationEmail);
router.get('/verify-email/:token',         verifyEmail);
router.get('/me',                          protect, getMe);
router.put('/change-password',             protect, changePassword);

module.exports = router;
