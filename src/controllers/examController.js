const FinalExam = require('../models/FinalExam');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Module = require('../models/Module');

// Helper function to check exam eligibility
const checkExamEligibility = async (studentId) => {
  try {
    // Get student's progress
    const progress = await Progress.find({ 
      studentId: studentId,
      status: 'completed'
    }).populate('moduleId');
 
    // Get only modules that have quizzes (exclude introduction modules)
    const modulesWithQuizzes = await Module.find({ 
      status: 'active',
      'quiz.questions.0': { $exists: true } // Only modules with at least 1 quiz question
    });
 
    console.log(`Student completed modules: ${progress.length}`);
    console.log(`Modules requiring quizzes: ${modulesWithQuizzes.length}`);
 
    // Check if student completed all modules that have quizzes
    if (progress.length !== modulesWithQuizzes.length) {
      return {
        eligible: false,
        reason: "Complete all modules with quizzes before taking the final exam"
      };
    }
 
    // Check quiz scores for modules that have quizzes
    for (const p of progress) {
      // Only check quiz scores if this module actually has a quiz
      if (p.moduleId.quiz && p.moduleId.quiz.questions && p.moduleId.quiz.questions.length > 0) {
        if (!p.quizScore || p.quizScore < 60) {
          return {
            eligible: false,
            reason: "You must pass all module quizzes (60% required) before taking the final exam"
          };
        }
      }
    }
 
    return { eligible: true, reason: "All requirements met" };
  } catch (error) {
    console.error('Eligibility check error:', error);
    return {
      eligible: false,
      reason: "Error checking eligibility"
    };
  }
};

// GET /api/exam  (admin — includes correct answers)
const getExamForAdmin = async (req, res) => {
  try {
    const exam = await FinalExam.findOne();
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/exam/eligibility
const checkEligibility = async (req, res) => {
  try {
    const eligibility = await checkExamEligibility(req.user._id);
    res.json(eligibility);
  } catch (error) {
    res.status(500).json({ error: "Failed to check eligibility" });
  }
};

// GET /api/exam/student  (student — correct answers stripped out)
const getExamForStudent = async (req, res) => {
  try {
    // Check eligibility first
    const eligibility = await checkExamEligibility(req.user._id);
    
    if (!eligibility.eligible) {
      return res.status(403).json({
        error: "Not eligible for exam",
        message: eligibility.reason
      });
    }

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

module.exports = { getExamForAdmin, getExamForStudent, createExam, updateExam, submitExam, checkEligibility };
