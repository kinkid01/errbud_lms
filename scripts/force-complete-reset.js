const mongoose = require('mongoose');
const Module = require('../src/models/Module');
const Lesson = require('../src/models/Lesson');
const Progress = require('../src/models/Progress');
const FinalExam = require('../src/models/FinalExam');
const Certificate = require('../src/models/Certificate');
const User = require('../src/models/User');
require('dotenv').config();

async function forceCompleteReset() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // 1. Delete ALL progress records completely
    const progressDeleteResult = await Progress.deleteMany({});
    console.log(`Deleted ${progressDeleteResult.deletedCount} progress records completely`);

    // 2. Delete ALL certificates completely
    const certificateDeleteResult = await Certificate.deleteMany({});
    console.log(`Deleted ${certificateDeleteResult.deletedCount} certificates completely`);

    // 3. Delete final exam completely
    const examDeleteResult = await FinalExam.deleteMany({});
    console.log(`Deleted ${examDeleteResult.deletedCount} final exams completely`);

    // 4. Clear quizzes from modules
    const moduleResult = await Module.updateMany(
      {},
      { $unset: { quiz: 1 } }
    );
    console.log(`Cleared quizzes from ${moduleResult.modifiedCount} modules`);

    // 5. Clear quizzes from lessons
    const lessonResult = await Lesson.updateMany(
      {},
      { $unset: { quiz: 1 } }
    );
    console.log(`Cleared quizzes from ${lessonResult.modifiedCount} lessons`);

    // 6. Reset user roles if needed (keep admin users)
    const userResetResult = await User.updateMany(
      { role: 'student' },
      { 
        $unset: { 
          lastLogin: 1,
          examAttempts: 1,
          examCompletedAt: 1
        }
      }
    );
    console.log(`Reset ${userResetResult.modifiedCount} student user data`);

    // 7. Clear any collections that might have cached data
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      if (collection.collectionName.includes('cache') || 
          collection.collectionName.includes('session') ||
          collection.collectionName.includes('temp')) {
        await collection.deleteMany({});
        console.log(`Cleared collection: ${collection.collectionName}`);
      }
    }

    // 8. Final verification
    const progressCount = await Progress.countDocuments();
    const certificateCount = await Certificate.countDocuments();
    const examCount = await FinalExam.countDocuments();
    const modulesWithQuiz = await Module.countDocuments({ quiz: { $exists: true } });
    const lessonsWithQuiz = await Lesson.countDocuments({ quiz: { $exists: true } });
    
    console.log('\n--- Final Verification ---');
    console.log(`Progress records: ${progressCount}`);
    console.log(`Certificates: ${certificateCount}`);
    console.log(`Final exams: ${examCount}`);
    console.log(`Modules with quiz: ${modulesWithQuiz}`);
    console.log(`Lessons with quiz: ${lessonsWithQuiz}`);

    if (progressCount === 0 && certificateCount === 0 && examCount === 0 && 
        modulesWithQuiz === 0 && lessonsWithQuiz === 0) {
      console.log('\nCOMPLETE RESET SUCCESSFUL!');
      console.log('Frontend should now show:');
      console.log('- Total Students: 0 (or only admins)');
      console.log('- Active Modules: (whatever modules exist)');
      console.log('- Certificates Issued: 0');
      console.log('- Completion Rate: 0%');
      console.log('- No student activity');
    } else {
      console.log('\nSome data may still remain. Check the counts above.');
    }

  } catch (error) {
    console.error('Error during complete reset:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the script
forceCompleteReset();
