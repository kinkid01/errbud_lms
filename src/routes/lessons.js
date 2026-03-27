const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  getLessonsByModule,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} = require('../controllers/lessonController');

router.get('/module/:moduleId', protect, getLessonsByModule);
router.get('/:id',              protect, getLessonById);
router.post('/',                protect, requireRole('admin'), createLesson);
router.put('/reorder',          protect, requireRole('admin'), reorderLessons);
router.put('/:id',              protect, requireRole('admin'), updateLesson);
router.delete('/:id',           protect, requireRole('admin'), deleteLesson);

module.exports = router;
