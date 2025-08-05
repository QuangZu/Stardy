# Quiz Stats API Testing Commands

## PowerShell Commands

### 1. Test Quiz Stats Endpoint
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$quizId = "68915d8afb3500752de068e1"

# Test the stats endpoint
Invoke-RestMethod -Uri "https://stardy-3old.onrender.com/api/quiz/$quizId/stats" -Method GET -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
```

### 2. Compare Original vs Stats Endpoint
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$quizId = "68915d8afb3500752de068e1"

# Original endpoint
Write-Host "=== Original Quiz Endpoint ===" -ForegroundColor Green
Invoke-RestMethod -Uri "https://stardy-3old.onrender.com/api/quiz/$quizId" -Method GET -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n=== Stats Endpoint ===" -ForegroundColor Blue
Invoke-RestMethod -Uri "https://stardy-3old.onrender.com/api/quiz/$quizId/stats" -Method GET -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
```

### 3. Get Authentication Token First
```powershell
# Login to get token
$loginResponse = Invoke-RestMethod -Uri "https://stardy-3old.onrender.com/api/auth/login" -Method POST -Body (@{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.token
Write-Host "Token: $token"

# Then use the token for quiz stats
Invoke-RestMethod -Uri "https://stardy-3old.onrender.com/api/quiz/68915d8afb3500752de068e1/stats" -Method GET -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
```

## Node.js Test Commands

### 1. Quick Test
```javascript
// Run in Node.js
const axios = require('axios');

async function testQuizStats() {
    const token = 'YOUR_JWT_TOKEN_HERE';
    const response = await axios.get('https://stardy-3old.onrender.com/api/quiz/68915d8afb3500752de068e1/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(JSON.stringify(response.data, null, 2));
}

testQuizStats();
```

### 2. Using the Test Script
```javascript
// Load the test script
const { testQuizStats } = require('./test-quiz-stats');

// Run the test
testQuizStats('YOUR_JWT_TOKEN_HERE');
```

## Expected Response Format

The `/api/quiz/:id/stats` endpoint should return:

```json
{
  "success": true,
  "data": {
    "quizId": "68915d8afb3500752de068e1",
    "title": "Introduction to Message Control Protocol",
    "description": "This quiz tests your understanding...",
    "totalQuestions": 5,
    "totalAttempts": 3,
    "averageScore": 75,
    "difficulty": "medium",
    "category": "General",
    "questionStats": [
      {
        "questionIndex": 0,
        "question": "Why is it difficult to definitively define 'MCP'?",
        "correctAnswer": 2,
        "incorrectAnswer": 1,
        "correctAnswerText": "The note explicitly states...",
        "incorrectAnswerText": "Some other option",
        "totalOptions": 4,
        "hasExplanation": true
      }
    ],
    "overallStats": {
      "questionsWithCorrectAnswers": 5,
      "questionsWithIncorrectAnswers": 5,
      "questionsWithExplanations": 3,
      "averageOptionsPerQuestion": 4.0,
      "passRate": 75
    }
  }
}
```

## Key Features

### ✅ Correct Answer Stats
- Shows correct answer index and text for each question
- Counts total questions with correct answers

### ❌ Incorrect Answer Stats  
- Shows incorrect answer index and text for each question
- Counts questions with specified incorrect answers
- Handles cases where incorrect answer is not set

### 📊 Overall Statistics
- Total attempts and average score
- Pass rate calculation
- Questions with explanations count
- Average options per question

### 📝 Question Breakdown
- Individual question analysis
- Correct/incorrect answer mapping
- Option count per question
- Explanation availability

## Troubleshooting

### 401 Unauthorized
- Check if your JWT token is valid
- Make sure you're logged in
- Token might be expired

### 404 Not Found
- Verify the quiz ID exists
- Check if you have access to this quiz
- Ensure the endpoint is deployed

### 500 Server Error
- The new endpoint might not be deployed yet
- Server needs to be restarted
- Check server logs for errors

## Testing Checklist

- [ ] Endpoint returns 200 status
- [ ] Response has correct JSON structure
- [ ] Shows correct answer for each question
- [ ] Shows incorrect answer for each question (if available)
- [ ] Displays overall statistics
- [ ] Handles authentication properly
- [ ] Works with the specific quiz ID: 68915d8afb3500752de068e1
