const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  getMyProgress,
  getUserProgress,
  enrollInModule,
  completeLessonAndSubmitQuiz,
  canTakeExam,
} = require('../controllers/progressController');

router.get('/me',                          protect, getMyProgress);
router.get('/user/:userId',                protect, requireRole('admin'), getUserProgress);
router.post('/enroll/:moduleId',           protect, requireRole('student'), enrollInModule);
router.put('/lesson/:lessonId/complete',   protect, requireRole('student'), completeLessonAndSubmitQuiz);
router.get('/can-take-exam',               protect, requireRole('student'), canTakeExam);

module.exports = router;
