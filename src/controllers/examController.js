const FinalExam = require('../models/FinalExam');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');

// GET /api/exam  (admin — includes correct answers)
const getExamForAdmin = async (req, res) => {
  try {
    const exam = await FinalExam.findOne();
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/exam/student  (student — correct answers stripped out)
const getExamForStudent = async (req, res) => {
  try {
    const exam = await FinalExam.findOne();
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not set up yet' });

    // Remove correctAnswer from each question before sending to student
    const safeQuestions = exam.questions.map((q) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
    }));

    res.status(200).json({
      success: true,
      data: {
        _id: exam._id,
        passingScore: exam.passingScore,
        timeLimit: exam.timeLimit,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/exam  (admin only — create the exam)
const createExam = async (req, res) => {
  try {
    const existing = await FinalExam.findOne();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Exam already exists. Use PUT to update.' });
    }
    const exam = await FinalExam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/exam  (admin only — update exam)
const updateExam = async (req, res) => {
  try {
    const exam = await FinalExam.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true, // Create if it doesn't exist
      runValidators: true,
    });
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/exam/submit  (student — submit answers)
// Body: { answers: [0, 2, 1, 3, ...] }  (array of selected option indexes)
const submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await FinalExam.findOne();
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Calculate score
    let correct = 0;
    exam.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / exam.questions.length) * 100);
    const passed = score >= exam.passingScore;

    // If passed, auto-issue a certificate
    if (passed) {
      await Certificate.findOneAndUpdate(
        { studentId: req.user._id },
        { studentId: req.user._id, studentName: req.user.name, score },
        { upsert: true, new: true }
      );

      // Mark certificateIssued on all progress records for this student
      await Progress.updateMany(
        { studentId: req.user._id },
        { certificateIssued: true }
      );
    }

    res.status(200).json({ success: true, score, passed, passingScore: exam.passingScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getExamForAdmin, getExamForStudent, createExam, updateExam, submitExam };
