const FinalExam = require('../models/FinalExam');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Module = require('../models/Module');

// Helper function to check exam eligibility
const checkExamEligibility = async (studentId) => {
  try {
    // Get all active modules
    const allActiveModules = await Module.find({ status: 'active' });
    
    if (allActiveModules.length === 0) {
      return {
        eligible: false,
        reasons: ['No active modules available']
      };
    }

    // Get student's progress for all modules
    const studentProgress = await Progress.find({ 
      studentId,
      moduleId: { $in: allActiveModules.map(m => m._id) }
    });

    const reasons = [];
    let eligible = true;

    // Check if student completed all active modules
    const completedModules = studentProgress.filter(p => p.status === 'completed');
    if (completedModules.length < allActiveModules.length) {
      eligible = false;
      const missingModules = allActiveModules.length - completedModules.length;
      reasons.push(`Must complete all ${allActiveModules.length} active modules (${missingModules} remaining)`);
    }

    // Check if all module quizzes passed (>= 60% score)
    const failedQuizzes = studentProgress.filter(p => 
      p.quizScore !== null && p.quizScore < 60
    );
    
    if (failedQuizzes.length > 0) {
      eligible = false;
      reasons.push(`Must pass all module quizzes with 60% or higher (${failedQuizzes.length} quizzes need retaking)`);
    }

    // Check for modules without quiz scores (course-level quizzes)
    const modulesWithoutQuizScores = studentProgress.filter(p => 
      p.status === 'completed' && (p.quizScore === null || p.quizScore === undefined)
    );
    
    if (modulesWithoutQuizScores.length > 0) {
      eligible = false;
      reasons.push(`Must complete all course-level quizzes (${modulesWithoutQuizScores.length} quizzes missing)`);
    }

    return {
      eligible,
      reasons,
      details: {
        totalModules: allActiveModules.length,
        completedModules: completedModules.length,
        passedQuizzes: studentProgress.filter(p => p.quizScore >= 60).length,
        failedQuizzes: failedQuizzes.length
      }
    };
  } catch (error) {
    console.error('Eligibility check error:', error);
    return {
      eligible: false,
      reasons: ['Error checking eligibility']
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
    res.status(200).json({ 
      success: true, 
      data: eligibility 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/exam/student  (student — correct answers stripped out)
const getExamForStudent = async (req, res) => {
  try {
    // Check eligibility first
    const eligibility = await checkExamEligibility(req.user._id);
    
    if (!eligibility.eligible) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not eligible for exam',
        reasons: eligibility.reasons,
        details: eligibility.details
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
