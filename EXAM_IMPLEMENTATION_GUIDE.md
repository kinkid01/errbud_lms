# Backend Implementation Guide for Exam Eligibility

## Required Backend Endpoints

### 1. Create Exam Eligibility Check
**Endpoint:** `GET /api/exam/eligibility`

**Purpose:** Check if current student is eligible to take final exam

**Authentication:** Required (student JWT token)

**Response Format:**
```json
{
  "eligible": true,
  "reason": "All requirements met"
}
```

**Or if not eligible:**
```json
{
  "eligible": false,
  "reason": "You must complete all module quizzes with at least 60% score before taking the final exam.",
  "missingRequirements": [
    {
      "moduleId": "module123",
      "moduleTitle": "Introduction to Programming",
      "status": "not_started",
      "quizScore": null
    }
  ]
}
```

**Implementation Logic:**
1. Get student's progress records
2. Get all active modules
3. Check if student completed ALL active modules
4. For each completed module with quiz, verify score >= 60
5. Return eligibility status

### 2. Enhance Existing Exam Questions Endpoint
**Endpoint:** `GET /api/exam/student`

**Required Change:** Add eligibility check at the start

**Implementation:**
```javascript
// Add this at the beginning of the endpoint
const eligibility = await checkExamEligibility(req.user.id);
if (!eligibility.eligible) {
  return res.status(403).json({
    error: "Not eligible for exam",
    message: eligibility.reason
  });
}

// Continue with existing logic...
```

## Database Schema Requirements

Your existing schemas should support this, but verify you have:

**Progress Collection:**
- `studentId` (ObjectId)
- `moduleId` (ObjectId) 
- `status` (String: 'not_started', 'in_progress', 'completed')
- `quizScore` (Number)
- `lessonProgress` (Array)

**Module Collection:**
- `status` (String: 'active', 'inactive')
- `quiz` (Object with quiz data)

## Implementation Steps

### Step 1: Create Eligibility Check Function
```javascript
async function checkExamEligibility(studentId) {
  // Get student's progress
  const progress = await Progress.find({ 
    studentId: studentId,
    status: 'completed'
  }).populate('moduleId');

  // Get all active modules
  const activeModules = await Module.find({ status: 'active' });

  // Check if all active modules are completed
  if (progress.length !== activeModules.length) {
    return {
      eligible: false,
      reason: "Complete all modules before taking the final exam"
    };
  }

  // Check quiz scores
  for (const p of progress) {
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
}
```

### Step 2: Add the Eligibility Endpoint
```javascript
router.get('/eligibility', authenticateStudent, async (req, res) => {
  try {
    const eligibility = await checkExamEligibility(req.user.id);
    res.json(eligibility);
  } catch (error) {
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});
```

### Step 3: Update Exam Questions Endpoint
```javascript
router.get('/student', authenticateStudent, async (req, res) => {
  try {
    // Add eligibility check
    const eligibility = await checkExamEligibility(req.user.id);
    if (!eligibility.eligible) {
      return res.status(403).json({
        error: "Not eligible for exam",
        message: eligibility.reason
      });
    }

    // Continue with your existing logic...
    const exam = await Exam.findOne(/* your existing query */);
    // ... rest of existing code
    
  } catch (error) {
    res.status(500).json({ error: "Failed to load exam" });
  }
});
```

## Testing Your Implementation

### Test Cases to Verify:

1. **New Student (No Progress)**
   - Expected: `eligible: false`
   - Should show missing modules

2. **Partial Progress**
   - Expected: `eligible: false` 
   - Should show incomplete modules

3. **Completed Modules, Failed Quiz**
   - Expected: `eligible: false`
   - Should mention quiz score requirement

4. **All Completed with Passing Quizzes**
   - Expected: `eligible: true`

### Manual Testing Steps:

1. **Test eligibility endpoint:**
   ```bash
   curl -H "Authorization: Bearer <student_token>" http://localhost:5000/api/exam/eligibility
   ```

2. **Test exam endpoint with ineligible student:**
   ```bash
   curl -H "Authorization: Bearer <ineligible_token>" http://localhost:5000/api/exam/student
   # Should return 403
   ```

3. **Test exam endpoint with eligible student:**
   ```bash
   curl -H "Authorization: Bearer <eligible_token>" http://localhost:5000/api/exam/student
   # Should return exam questions
   ```

## Frontend Integration Notes

The frontend is already configured to:
- Call `/exam/eligibility` before loading exam
- Show ineligible UI if not eligible
- Handle 403 responses from exam endpoint
- Gracefully fallback if eligibility endpoint doesn't exist yet

## Important Reminders

1. **Authentication:** Make sure both endpoints require student authentication
2. **Error Handling:** Return proper HTTP status codes (403 for ineligible, 500 for errors)
3. **Performance:** Consider adding database indexes on `Progress.studentId` and `Progress.status`
4. **Security:** Students should only be able to check their own eligibility

Once you implement these endpoints, the exam flow will properly enforce quiz completion requirements!
