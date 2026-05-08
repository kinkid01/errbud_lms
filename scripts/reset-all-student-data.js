const mongoose = require('mongoose');
const Module = require('../src/models/Module');
const Lesson = require('../src/models/Lesson');
const Progress = require('../src/models/Progress');
const FinalExam = require('../src/models/FinalExam');
const Certificate = require('../src/models/Certificate');
require('dotenv').config();

async function resetAllStudentData() {
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

    // 5. Delete final exam completely
    const examResult = await FinalExam.deleteMany({});
    console.log(`Deleted ${examResult.deletedCount} final exams`);

    // 6. Delete ALL certificates
    const certificateResult = await Certificate.deleteMany({});
    console.log(`Deleted ${certificateResult.deletedCount} certificates`);

    // 7. Reset ALL progress records to initial state
    const resetProgressResult = await Progress.updateMany(
      {},
      { 
        $set: { 
          status: 'not_started',
          completedAt: null,
          certificateIssued: false,
          enrolledAt: new Date() // Reset enrollment date
        },
        $unset: {
          quizScore: 1,
          finalExamScore: 1
        }
      }
    );
    console.log(`Reset ${resetProgressResult.modifiedCount} progress records to initial state`);

    // 8. Reset lesson progress to not_started
    const resetLessonProgressResult = await Progress.updateMany(
      {},
      { 
        $set: { 
          'lessonProgress.$[].status': 'not_started',
          'lessonProgress.$[].completedAt': null,
          'lessonProgress.$[].quizScore': null,
          'lessonProgress.$[].attempts': 0
        }
      }
    );
    console.log(`Reset lesson progress for ${resetLessonProgressResult.modifiedCount} progress records`);

    // 9. Verification
    const modulesWithQuiz = await Module.countDocuments({ quiz: { $exists: true } });
    const lessonsWithQuiz = await Lesson.countDocuments({ quiz: { $exists: true } });
    const progressWithQuizScore = await Progress.countDocuments({ quizScore: { $exists: true } });
    const examCount = await FinalExam.countDocuments();
    const certificateCount = await Certificate.countDocuments();
    const completedProgressCount = await Progress.countDocuments({ status: 'completed' });
    
    console.log('\n--- Verification ---');
    console.log(`Modules with quiz data: ${modulesWithQuiz}`);
    console.log(`Lessons with quiz data: ${lessonsWithQuiz}`);
    console.log(`Progress with quiz scores: ${progressWithQuizScore}`);
    console.log(`Final exams remaining: ${examCount}`);
    console.log(`Certificates remaining: ${certificateCount}`);
    console.log(`Completed progress records: ${completedProgressCount}`);

    if (modulesWithQuiz === 0 && lessonsWithQuiz === 0 && progressWithQuizScore === 0 && examCount === 0 && certificateCount === 0) {
      console.log('\nAll student data has been successfully reset!');
      console.log('Students must:');
      console.log('1. Complete all modules again');
      console.log('2. Pass all course-level quizzes again');
      console.log('3. Take the final exam again');
      console.log('4. Earn new certificates');
    } else {
      console.log('\nWarning: Some data may still remain. Manual cleanup may be needed.');
    }

  } catch (error) {
    console.error('Error resetting student data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the script
resetAllStudentData();
