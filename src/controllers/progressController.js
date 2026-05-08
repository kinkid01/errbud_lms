const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');

// GET /api/progress/me
const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.user._id })
      .populate('moduleId', 'title coverImage duration');
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/progress/user/:userId  (admin only)
const getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.userId })
      .populate('moduleId', 'title');
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/progress/enroll/:moduleId
const enrollInModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Check module exists
    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    // Check if already enrolled
    const existing = await Progress.findOne({ studentId: req.user._id, moduleId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this module' });
    }

    // Build initial lesson progress array
    const lessons = await Lesson.find({ moduleId }).sort({ order: 1 });
    const lessonProgress = lessons.map((l) => ({
      lessonId: l._id,
      status: 'not_started',
    }));

    const progress = await Progress.create({
      studentId: req.user._id,
      moduleId,
      status: 'in_progress',
      lessonProgress,
    });

    res.status(201).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/progress/lesson/:lessonId/complete
// Body: { quizScore: 80 }
const completeLessonAndSubmitQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { quizScore } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const progress = await Progress.findOne({
      studentId: req.user._id,
      moduleId: lesson.moduleId,
    });
    if (!progress) return res.status(404).json({ success: false, message: 'Not enrolled in this module' });

    // Find and update this lesson's progress entry
    const lp = progress.lessonProgress.find((l) => l.lessonId.toString() === lessonId);
    if (!lp) return res.status(404).json({ success: false, message: 'Lesson not found in progress' });

    lp.status = 'completed';
    lp.completedAt = new Date();

    if (req.body.quizScore !== undefined) {
      lp.quizScore = quizScore;
      lp.attempts = (lp.attempts || 0) + 1;
    }

    // Check if all lessons are now completed → mark the whole module as completed
    const allDone = progress.lessonProgress.every((l) => l.status === 'completed');
    if (allDone) {
      progress.status = 'completed';
      progress.completedAt = new Date();
    }

    await progress.save();
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/progress/can-take-exam
const canTakeExam = async (req, res) => {
  try {
    const allModules = await Module.find({ status: 'active' });
    const completedCount = await Progress.countDocuments({
      studentId: req.user._id,
      status: 'completed',
    });

    const eligible = completedCount >= allModules.length && allModules.length > 0;
    res.status(200).json({ success: true, eligible, completedCount, totalModules: allModules.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/progress/course/:courseId/complete
const completeCourseQuiz = async (req, res) => {
  try {
    const { quizScore } = req.body;
    const userId = req.user._id; // Assuming auth middleware sets user
    
    // Find or create user progress for this course
    let progress = await Progress.findOne({ 
      studentId: userId, 
      moduleId: req.params.courseId 
    });
    
    if (!progress) {
      progress = new Progress({
        studentId: userId,
        moduleId: req.params.courseId,
        status: 'not_started',
        enrolledAt: new Date()
      });
    }
    
    // Update quiz score and status
    progress.quizScore = quizScore;
    progress.status = quizScore >= 60 ? 'completed' : 'in_progress';
    if (quizScore >= 60) {
      progress.completedAt = new Date();
    }
    
    await progress.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Course progress updated successfully',
      data: progress 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating course progress', 
      error: error.message 
    });
  }
};

module.exports = { getMyProgress, getUserProgress, enrollInModule, completeLessonAndSubmitQuiz, canTakeExam, completeCourseQuiz };
