const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');

// GET /api/modules
const getAllModules = async (req, res) => {
  try {
    // Admins see all; students only see active modules
    const filter = req.user.role === 'admin' ? {} : { status: 'active' };
    const modules = await Module.find(filter)
      .select('title description coverImage status createdAt updatedAt quiz createdBy')
      .sort({ createdAt: -1 });

    // Count enrollments per module in one aggregation query
    const enrollmentCounts = await Progress.aggregate([
      { $group: { _id: '$moduleId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    enrollmentCounts.forEach((e) => { countMap[String(e._id)] = e.count; });

    const data = modules.map((m) => ({
      ...m.toObject(),
      enrollmentCount: countMap[String(m._id)] || 0,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/modules/:id
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    // Also return the lessons for this module
    const lessons = await Lesson.find({ moduleId: req.params.id }).sort({ order: 1 });
    res.status(200).json({ success: true, data: { ...module.toObject(), lessons } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/modules  (admin only)
const createModule = async (req, res) => {
  try {
    const module = await Module.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/modules/:id  (admin only)
const updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });
    res.status(200).json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/modules/:id  (admin only)
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    // Also delete all lessons that belong to this module
    await Lesson.deleteMany({ moduleId: req.params.id });

    res.status(200).json({ success: true, message: 'Module and its lessons deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/modules/:courseId/quiz
const updateModuleQuiz = async (req, res) => {
  try {
    const { quiz } = req.body;
    const course = await Module.findByIdAndUpdate(
      req.params.courseId,
      { 
        quiz: {
          ...quiz,
          id: quiz.id || `course-${req.params.courseId}-quiz`,
          courseId: req.params.courseId
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Course quiz updated successfully',
      data: course 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating course quiz', 
      error: error.message 
    });
  }
};

module.exports = { getAllModules, getModuleById, createModule, updateModule, deleteModule, updateModuleQuiz };
