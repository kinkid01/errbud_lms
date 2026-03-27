const Lesson = require('../models/Lesson');

// GET /api/lessons/module/:moduleId
const getLessonsByModule = async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
    res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/lessons/:id
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/lessons  (admin only)
const createLesson = async (req, res) => {
  try {
    // Auto-assign order: count existing lessons in this module + 1
    const count = await Lesson.countDocuments({ moduleId: req.body.moduleId });
    const lesson = await Lesson.create({ ...req.body, order: count + 1 });
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/lessons/:id  (admin only)
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/lessons/:id  (admin only)
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/lessons/reorder  (admin only)
// Body: { moduleId, orderedIds: ['id1', 'id2', 'id3'] }
const reorderLessons = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    const updates = orderedIds.map((id, index) =>
      Lesson.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(updates);
    res.status(200).json({ success: true, message: 'Lessons reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLessonsByModule, getLessonById, createLesson, updateLesson, deleteLesson, reorderLessons };
