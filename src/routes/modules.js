const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} = require('../controllers/moduleController');

router.get('/',      protect, getAllModules);
router.get('/:id',   protect, getModuleById);
router.post('/',     protect, requireRole('admin'), createModule);
router.put('/:id',   protect, requireRole('admin'), updateModule);
router.delete('/:id',protect, requireRole('admin'), deleteModule);

module.exports = router;
