const Certificate = require('../models/Certificate');
const User = require('../models/User');

// GET /api/certificates  (admin only)
const getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find().populate('studentId', 'name email').sort({ issuedAt: -1 });
    res.status(200).json({ success: true, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificates/mine  (student)
const getMyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ studentId: req.user._id });
    if (!cert) return res.status(404).json({ success: false, message: 'No certificate issued yet' });
    res.status(200).json({ success: true, data: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/certificates/issue/:studentId  (admin only — manual issue)
const issueCertificate = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const cert = await Certificate.findOneAndUpdate(
      { studentId: student._id },
      { studentId: student._id, studentName: student.name, score: req.body.score || 0 },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCertificates, getMyCertificate, issueCertificate };
