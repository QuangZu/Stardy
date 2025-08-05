# Quiz IncorrectAnswer Field Implementation

## Overview
This update adds the `incorrectAnswer` field to quiz questions in the database, allowing the system to track and display both correct and incorrect answer statistics.

## Changes Made

### 1. Database Schema Update (`server/api/models/quizModel.js`)
- Added `incorrectAnswer` field to `QuestionSchema`
- Made the field optional (`required: false`) for backward compatibility
- Field stores the index of a common incorrect answer option

```javascript
incorrectAnswer: {
    type: Number,
    required: false // Optional field for backward compatibility
}
```

### 2. AI Prompt Templates Update (`server/api/ai/promptTemplates.js`)
- Updated `generateQuizFromNote` template to include `incorrectAnswer` in JSON format
- Updated `generateQuiz` template to use JSON format and include `incorrectAnswer`
- Added requirements for AI to specify both correct and incorrect answer indices

### 3. Quiz Controller Updates (`server/api/controllers/quizController.js`)
- Modified quiz generation to handle optional `incorrectAnswer` field
- Updated quiz submission logic to properly count correct/incorrect answers
- Added new `getQuizStatistics` endpoint for detailed quiz statistics

### 4. New API Endpoint
- **GET** `/api/quiz/:id/statistics` - Returns detailed quiz statistics including question-level data

## API Endpoints

### Original Endpoint
- **GET** `/api/quiz/:id` - Returns full quiz data (unchanged)

### New Statistics Endpoint
- **GET** `/api/quiz/:id/statistics` - Returns quiz statistics
- **Authentication**: Required (Bearer token)
- **Response**: Detailed statistics including question breakdown

Example response:
```json
{
  "success": true,
  "data": {
    "quizId": "68915d8afb3500752de068e1",
    "title": "Introduction to Message Control Protocol",
    "totalQuestions": 5,
    "totalAttempts": 3,
    "averageScore": 75,
    "questionStats": [
      {
        "questionIndex": 0,
        "question": "Why is it difficult to definitively define 'MCP'?",
        "totalOptions": 4,
        "correctAnswer": 2,
        "incorrectAnswer": 1,
        "hasExplanation": true
      }
    ]
  }
}
```

## Testing

### 1. Test Existing Quiz
Use the provided test script to check if the quiz has `incorrectAnswer` fields:

```javascript
// test-incorrect-answer.js
const { testIncorrectAnswerField } = require('./test-incorrect-answer');
testIncorrectAnswerField('YOUR_JWT_TOKEN');
```

### 2. Test New Quiz Generation
Generate a new quiz to verify the `incorrectAnswer` field is included:

```javascript
const { testNewQuizGeneration } = require('./test-incorrect-answer');
testNewQuizGeneration('TOKEN', 'NOTE_ID', 'USER_ID');
```

### 3. Test API Endpoints
```javascript
const { testQuizEndpoints } = require('./test-quiz-statistics');
testQuizEndpoints('YOUR_JWT_TOKEN');
```

## Migration for Existing Data

### Option 1: Server-Side Migration
Run the migration script on the server:

```javascript
// migrate-quiz-data.js
const { migrateQuizData } = require('./migrate-quiz-data');
migrateQuizData();
```

### Option 2: Check Migration Status
```javascript
const { checkMigrationStatus } = require('./migrate-quiz-data');
checkMigrationStatus();
```

## Expected Behavior

### For New Quizzes (After Update)
- All questions will have both `correctAnswer` and `incorrectAnswer` fields
- AI will generate appropriate incorrect answer indices
- Quiz statistics will show detailed breakdown

### For Existing Quizzes (Before Update)
- Questions may not have `incorrectAnswer` field
- System handles this gracefully with null checks
- Migration script can add missing fields

### Quiz Submission Statistics
- **Correct Answers**: Count of questions answered correctly
- **Incorrect Answers**: Count of questions answered incorrectly
- **Total Questions**: Total number of questions in quiz
- **Score**: Percentage based on correct answers
- **Pass Status**: Whether score >= 70%

## Files Modified

1. `server/api/models/quizModel.js` - Added incorrectAnswer field
2. `server/api/ai/promptTemplates.js` - Updated AI prompts
3. `server/api/controllers/quizController.js` - Updated logic and added statistics endpoint
4. `server/api/routes/quizRoutes.js` - Added statistics route

## Files Created

1. `test-incorrect-answer.js` - Test script for incorrectAnswer field
2. `test-quiz-statistics.js` - Test script for statistics endpoint
3. `migrate-quiz-data.js` - Migration script for existing data
4. `simple-quiz-test.js` - Simple API test script

## Deployment Notes

1. **Database Migration**: Run migration script after deployment to update existing quizzes
2. **Server Restart**: Required to load new endpoints and logic
3. **Testing**: Verify both old and new quizzes work correctly
4. **Monitoring**: Check that AI generates valid incorrectAnswer values

## Troubleshooting

### If incorrectAnswer is missing in new quizzes:
1. Check AI prompt templates are updated
2. Verify AI service is generating JSON with incorrectAnswer field
3. Check quiz controller validation logic

### If existing quizzes break:
1. Ensure incorrectAnswer field is optional in schema
2. Check null/undefined handling in submission logic
3. Run migration script to add missing fields

### If statistics endpoint returns 404:
1. Verify server has been restarted
2. Check route is properly registered
3. Ensure authentication token is valid

## Next Steps

1. Deploy the updated code
2. Run migration script for existing data
3. Test with real quiz data
4. Monitor AI generation quality
5. Consider adding more detailed analytics
