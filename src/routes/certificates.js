const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  getAllCertificates,
  getMyCertificate,
  issueCertificate,
} = require('../controllers/certificateController');

router.get('/',                    protect, requireRole('admin'), getAllCertificates);
router.get('/mine',                protect, requireRole('student'), getMyCertificate);
router.post('/issue/:studentId',   protect, requireRole('admin'), issueCertificate);

module.exports = router;
