const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  getExamForAdmin,
  getExamForStudent,
  createExam,
  updateExam,
  submitExam,
  checkEligibility,
  debugEligibility,
} = require('../controllers/examController');

router.get('/',         protect, requireRole('admin'), getExamForAdmin);
router.get('/eligibility', protect, requireRole('student'), checkEligibility);
router.get('/debug-eligibility', protect, requireRole('student'), debugEligibility);
router.get('/student',  protect, requireRole('student'), getExamForStudent);
router.post('/',        protect, requireRole('admin'), createExam);
router.put('/',         protect, requireRole('admin'), updateExam);
router.post('/submit',  protect, requireRole('student'), submitExam);

module.exports = router;
