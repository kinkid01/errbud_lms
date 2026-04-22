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
 
    console.log(`[ELIGIBILITY] Student completed modules: ${progress.length}`);
    console.log(`[ELIGIBILITY] Modules requiring quizzes: ${modulesWithQuizzes.length}`);
 
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
    console.error('[ELIGIBILITY] Error:', error);
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
    console.error('[ELIGIBILITY] Endpoint error:', error);
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
    console.error('[ELIGIBILITY] Exam endpoint error:', error);
    res.status(500).json({ error: "Failed to load exam" });
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

// GET /api/exam/debug-eligibility
const debugEligibility = async (req, res) => {
  console.log('--- DEBUG EXAM ELIGIBILITY ENDPOINT CALLED ---');
  const studentId = req.user._id;
 
  try {
    // 1. Get ALL active modules
    const allActiveModules = await Module.find({ status: 'active' });
    console.log(`[DEBUG] Total active modules: ${allActiveModules.length}`);
    
    // 2. Get only modules that have quizzes
    const modulesWithQuizzes = await Module.find({ 
      status: 'active',
      'quiz.questions.0': { $exists: true }
    });
    console.log(`[DEBUG] Modules with quizzes: ${modulesWithQuizzes.length}`);
    
    // 3. Get student's completed progress
    const progress = await Progress.find({ 
      studentId: studentId,
      status: 'completed'
    }).populate('moduleId');
    console.log(`[DEBUG] Student progress records: ${progress.length}`);
    
    // 4. Check module by module
    let issues = [];
    let passedCount = 0;
    
    for (const module of modulesWithQuizzes) {
      const moduleProgress = progress.find(p => 
        p.moduleId && p.moduleId._id.toString() === module._id.toString()
      );
      
      console.log(`\n[DEBUG] Module: ${module.title}`);
      console.log(`[DEBUG]   - Has quiz: ${module.quiz?.questions?.length || 0} questions`);
      console.log(`[DEBUG]   - Progress: ${moduleProgress ? 'found' : 'not found'}`);
      console.log(`[DEBUG]   - Quiz score: ${moduleProgress?.quizScore || 'N/A'}`);
      
      if (!moduleProgress) {
        issues.push(`"${module.title}": No progress record found`);
      } else if (!moduleProgress.quizScore) {
        issues.push(`"${module.title}": Quiz not taken`);
      } else if (moduleProgress.quizScore < 60) {
        issues.push(`"${module.title}": Score ${moduleProgress.quizScore}% < 60%`);
      } else {
        passedCount++;
        console.log(`[DEBUG]   - Quiz passed`);
      }
    }
    
    // 5. Final determination
    const eligible = issues.length === 0;
    
    console.log(`\n[DEBUG] FINAL RESULT:`);
    console.log(`[DEBUG] - Modules requiring quizzes: ${modulesWithQuizzes.length}`);
    console.log(`[DEBUG] - Quizzes passed: ${passedCount}`);
    console.log(`[DEBUG] - Issues found: ${issues.length}`);
    console.log(`[DEBUG] - Eligible: ${eligible}`);
    
    if (issues.length > 0) {
      console.log(`[DEBUG] Issues:`, issues);
    }
    
    return res.json({
      eligible,
      reason: eligible ? "All requirements met" : issues.join('; '),
      debugInfo: {
        totalActiveModules: allActiveModules.length,
        modulesWithQuizzesCount: modulesWithQuizzes.length,
        studentProgressCount: progress.length,
        quizzesPassed: passedCount,
        issues,
        moduleDetails: modulesWithQuizzes.map(m => ({
          title: m.title,
          hasQuiz: m.quiz?.questions?.length > 0,
          quizQuestions: m.quiz?.questions?.length || 0,
          progressFound: progress.some(p => p.moduleId && p.moduleId._id.toString() === m._id.toString()),
          quizScore: progress.find(p => p.moduleId && p.moduleId._id.toString() === m._id.toString())?.quizScore || null
        }))
      }
    });
    
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return res.status(500).json({ 
      error: "Debug endpoint failed",
      details: error.message 
    });
  }
};

// GET /api/exam/test-eligibility - Simple test endpoint
const testEligibility = async (req, res) => {
  try {
    console.log('[TEST] Eligibility test endpoint called');
    const eligibility = await checkExamEligibility(req.user._id);
    console.log('[TEST] Eligibility result:', eligibility);
    return res.json({
      message: "Test endpoint working",
      eligibility: eligibility
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return res.status(500).json({ 
      error: "Test endpoint failed",
      details: error.message 
    });
  }
};

module.exports = { getExamForAdmin, getExamForStudent, createExam, updateExam, submitExam, checkEligibility, debugEligibility, testEligibility };
