const mongoose = require('mongoose');
const Module = require('../src/models/Module');
const Lesson = require('../src/models/Lesson');
const Progress = require('../src/models/Progress');
const FinalExam = require('../src/models/FinalExam');
const Certificate = require('../src/models/Certificate');
require('dotenv').config();

async function clearAllQuizData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // 1. Clear course-level quizzes from all modules
    const moduleResult = await Module.updateMany(
      {},
      { $unset: { quiz: 1 } }
    );
    console.log(`Cleared quizzes from ${moduleResult.modifiedCount} modules`);

    // 2. Clear lesson-level quizzes from all lessons
    const lessonResult = await Lesson.updateMany(
      {},
      { $unset: { quiz: 1 } }
    );
    console.log(`Cleared quizzes from ${lessonResult.modifiedCount} lessons`);

    // 3. Clear quiz scores from progress records
    const progressResult = await Progress.updateMany(
      {},
      { $unset: { quizScore: 1 } }
    );
    console.log(`Cleared quiz scores from ${progressResult.modifiedCount} progress records`);

    // 4. Clear lesson quiz scores from lesson progress arrays
    const lessonProgressResult = await Progress.updateMany(
      {},
      { $unset: { 'lessonProgress.$[].quizScore': 1 } }
    );
    console.log(`Cleared lesson quiz scores from progress records`);

    // 5. Clear final exam (if exists)
    const examResult = await FinalExam.deleteMany({});
    console.log(`Deleted ${examResult.deletedCount} final exams`);

    // 6. Clear certificates (optional - comment out if you want to keep certificates)
    // const certificateResult = await Certificate.deleteMany({});
    // console.log(`Deleted ${certificateResult.deletedCount} certificates`);

    // 7. Reset progress status to 'not_started' for all users
    const resetProgressResult = await Progress.updateMany(
      {},
      { 
        $set: { 
          status: 'not_started',
          completedAt: null,
          certificateIssued: false
        }
      }
    );
    console.log(`Reset ${resetProgressResult.modifiedCount} progress records to not_started`);

    // 8. Verify no quiz data remains
    const modulesWithQuiz = await Module.countDocuments({ quiz: { $exists: true } });
    const lessonsWithQuiz = await Lesson.countDocuments({ quiz: { $exists: true } });
    const progressWithQuizScore = await Progress.countDocuments({ quizScore: { $exists: true } });
    
    console.log('\n--- Verification ---');
    console.log(`Modules with quiz data: ${modulesWithQuiz}`);
    console.log(`Lessons with quiz data: ${lessonsWithQuiz}`);
    console.log(`Progress with quiz scores: ${progressWithQuizScore}`);

    if (modulesWithQuiz === 0 && lessonsWithQuiz === 0 && progressWithQuizScore === 0) {
      console.log('\nAll quiz data has been successfully cleared! Ready for fresh testing.');
    } else {
      console.log('\nWarning: Some quiz data may still remain. Manual cleanup may be needed.');
    }

  } catch (error) {
    console.error('Error clearing quiz data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the script
clearAllQuizData();
