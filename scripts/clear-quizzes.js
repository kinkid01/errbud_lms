const mongoose = require('mongoose');
const Module = require('../src/models/Module');
const Lesson = require('../src/models/Lesson');
const Progress = require('../src/models/Progress');
require('dotenv').config();

async function clearAllQuizzes() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Clear course-level quizzes from all modules
    const moduleResult = await Module.updateMany(
      {},
      { $unset: { quiz: 1 } }
    );
    console.log(`Cleared quizzes from ${moduleResult.modifiedCount} modules`);

    // Clear lesson-level quizzes from all lessons
    const lessonResult = await Lesson.updateMany(
      {},
      { $unset: { quiz: 1 } }
    );
    console.log(`Cleared quizzes from ${lessonResult.modifiedCount} lessons`);

    // Clear quiz scores from progress records
    const progressResult = await Progress.updateMany(
      {},
      { $unset: { quizScore: 1 } }
    );
    console.log(`Cleared quiz scores from ${progressResult.modifiedCount} progress records`);

    // Clear lesson quiz scores from lesson progress
    const lessonProgressResult = await Progress.updateMany(
      {},
      { $unset: { 'lessonProgress.$[].quizScore': 1 } }
    );
    console.log(`Cleared lesson quiz scores from progress records`);

    console.log('\nAll quiz data has been cleared successfully!');
    console.log('You can now start fresh with the new course-level quiz implementation.');

  } catch (error) {
    console.error('Error clearing quizzes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the script
clearAllQuizzes();
