// Debug Exam Eligibility Tool
// Run this in browser console to check exam eligibility status

(async function debugExamEligibility() {
  console.log('=== Exam Eligibility Debug ===');
  
  try {
    // 1. Check modules
    const modulesRes = await fetch('/api/modules', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const modules = await modulesRes.json();
    console.log('Total modules:', modules.data?.length || 0);
    
    // 2. Check progress
    const progressRes = await fetch('/api/progress/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const progress = await progressRes.json();
    console.log('Progress records:', progress.data?.length || 0);
    
    // 3. Check eligibility
    const eligibilityRes = await fetch('/api/exam/eligibility', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const eligibility = await eligibilityRes.json();
    console.log('Eligibility:', eligibility);
    
    // 4. Detailed analysis
    if (modules.data && progress.data) {
      const activeModules = modules.data.filter(m => m.status !== 'inactive');
      const modulesWithQuizzes = activeModules.filter(m => m.quiz?.questions?.length > 0);
      const completedModules = progress.data.filter(p => p.status === 'completed');
      
      console.log('\n=== Detailed Analysis ===');
      console.log('Active modules:', activeModules.length);
      console.log('Modules with quizzes:', modulesWithQuizzes.length);
      console.log('Completed modules:', completedModules.length);
      
      let quizRequiredCount = 0;
      let quizPassedCount = 0;
      let issues = [];
      
      // Check each module
      modulesWithQuizzes.forEach(module => {
        quizRequiredCount++;
        const moduleProgress = progress.data.find(p => 
          (p.moduleId?._id || p.moduleId) === module._id
        );
        
        console.log(`\nModule: ${module.title}`);
        console.log(`- ID: ${module._id}`);
        console.log(`- Status: ${moduleProgress?.status || 'not found'}`);
        console.log(`- Quiz questions: ${module.quiz?.questions?.length || 0}`);
        console.log(`- Quiz score: ${moduleProgress?.quizScore || 'N/A'}`);
        
        if (module.quiz?.questions?.length > 0) {
          if (!moduleProgress?.quizScore) {
            console.log('  -> ISSUE: Quiz not taken');
            issues.push(`"${module.title}": Quiz not taken`);
          } else if (moduleProgress.quizScore < 60) {
            console.log('  -> ISSUE: Quiz score below 60%');
            issues.push(`"${module.title}": Score ${moduleProgress.quizScore}% < 60%`);
          } else {
            console.log('  -> OK: Quiz passed');
            quizPassedCount++;
          }
        }
      });
      
      console.log('\n=== Summary ===');
      console.log(`Modules requiring quizzes: ${quizRequiredCount}`);
      console.log(`Quizzes passed: ${quizPassedCount}`);
      console.log(`Quizzes remaining: ${quizRequiredCount - quizPassedCount}`);
      
      if (issues.length > 0) {
        console.log('\n=== Issues Found ===');
        issues.forEach(issue => console.log('- ' + issue));
      } else {
        console.log('\n=== All Quizzes Completed! ===');
        console.log('If exam is still locked, this is a BACKEND issue.');
        console.log('The backend eligibility logic is incorrectly counting the introduction module.');
      }
      
      // Also show modules without quizzes for reference
      const modulesWithoutQuizzes = activeModules.filter(m => !m.quiz?.questions?.length || m.quiz.questions.length === 0);
      if (modulesWithoutQuizzes.length > 0) {
        console.log('\n=== Modules Without Quizzes (should not count toward exam) ===');
        modulesWithoutQuizzes.forEach(module => {
          console.log(`- ${module.title} (ID: ${module._id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
})();
