const axios = require('axios');

const backendURL = 'https://stardy-3old.onrender.com/api';
const quizId = '68915d8afb3500752de068e1';

// Test the /api/quiz/:id/stats endpoint
async function testQuizStats(token) {
    try {
        console.log('📊 Testing /api/quiz/:id/stats endpoint...');
        console.log('=' .repeat(60));
        
        const response = await axios.get(`${backendURL}/quiz/${quizId}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Quiz stats endpoint successful!');
        
        const stats = response.data.data;
        
        // Display basic quiz information
        console.log('\n📋 Quiz Information:');
        console.log(`- Quiz ID: ${stats.quizId}`);
        console.log(`- Title: ${stats.title}`);
        console.log(`- Description: ${stats.description}`);
        console.log(`- Category: ${stats.category}`);
        console.log(`- Difficulty: ${stats.difficulty}`);
        
        // Display attempt statistics
        console.log('\n📈 Attempt Statistics:');
        console.log(`- Total Questions: ${stats.totalQuestions}`);
        console.log(`- Total Attempts: ${stats.totalAttempts}`);
        console.log(`- Average Score: ${stats.averageScore}%`);
        
        // Display overall statistics
        if (stats.overallStats) {
            console.log('\n📊 Overall Statistics:');
            console.log(`- Questions with Correct Answers: ${stats.overallStats.questionsWithCorrectAnswers}`);
            console.log(`- Questions with Incorrect Answers: ${stats.overallStats.questionsWithIncorrectAnswers}`);
            console.log(`- Questions with Explanations: ${stats.overallStats.questionsWithExplanations}`);
            console.log(`- Average Options per Question: ${stats.overallStats.averageOptionsPerQuestion.toFixed(1)}`);
            console.log(`- Pass Rate: ${stats.overallStats.passRate}%`);
        }
        
        // Display question-by-question breakdown
        if (stats.questionStats && stats.questionStats.length > 0) {
            console.log('\n📝 Question-by-Question Correct/Incorrect Breakdown:');
            console.log('-'.repeat(80));
            
            stats.questionStats.forEach((question, index) => {
                console.log(`\n${index + 1}. ${question.question}`);
                console.log(`   📍 Question Index: ${question.questionIndex}`);
                console.log(`   ✅ Correct Answer (${question.correctAnswer}): "${question.correctAnswerText}"`);
                
                if (question.incorrectAnswer !== null && question.incorrectAnswer !== undefined) {
                    console.log(`   ❌ Incorrect Answer (${question.incorrectAnswer}): "${question.incorrectAnswerText}"`);
                } else {
                    console.log(`   ❌ Incorrect Answer: Not specified`);
                }
                
                console.log(`   📊 Total Options: ${question.totalOptions}`);
                console.log(`   💡 Has Explanation: ${question.hasExplanation ? 'Yes' : 'No'}`);
            });
        }
        
        // Summary of correct/incorrect data
        console.log('\n🎯 Correct/Incorrect Summary:');
        const questionsWithIncorrect = stats.questionStats.filter(q => 
            q.incorrectAnswer !== null && q.incorrectAnswer !== undefined
        ).length;
        const questionsWithoutIncorrect = stats.totalQuestions - questionsWithIncorrect;
        
        console.log(`- Questions with specified incorrect answers: ${questionsWithIncorrect}/${stats.totalQuestions}`);
        console.log(`- Questions without specified incorrect answers: ${questionsWithoutIncorrect}/${stats.totalQuestions}`);
        console.log(`- Percentage with incorrect answers: ${Math.round((questionsWithIncorrect / stats.totalQuestions) * 100)}%`);
        
        if (questionsWithIncorrect === stats.totalQuestions) {
            console.log('🎉 Perfect! All questions have both correct and incorrect answers specified!');
        } else if (questionsWithIncorrect > 0) {
            console.log('⚠️  Some questions have incorrect answers, some don\'t (mixed data)');
        } else {
            console.log('⚠️  No questions have incorrect answers specified (old quiz format)');
        }
        
        console.log('\n📄 Full Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error testing quiz stats:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('🔐 Authentication failed. Make sure your token is valid.');
        } else if (error.response?.status === 404) {
            console.log('🔍 Quiz not found. Check the quiz ID.');
        } else if (error.response?.status === 500) {
            console.log('🔧 Server error. The endpoint might not be deployed yet.');
        }
        
        throw error;
    }
}

// Compare original quiz endpoint vs stats endpoint
async function compareEndpoints(token) {
    try {
        console.log('\n🔄 Comparing /api/quiz/:id vs /api/quiz/:id/stats...');
        console.log('=' .repeat(60));
        
        // Get original quiz data
        console.log('📋 Fetching original quiz data...');
        const originalResponse = await axios.get(`${backendURL}/quiz/${quizId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Get stats data
        console.log('📊 Fetching stats data...');
        const statsResponse = await axios.get(`${backendURL}/quiz/${quizId}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n📊 Comparison Results:');
        console.log('Original endpoint returns:', Object.keys(originalResponse.data).join(', '));
        console.log('Stats endpoint returns:', Object.keys(statsResponse.data.data).join(', '));
        
        console.log('\n🎯 Key Differences:');
        console.log('- Original: Full quiz data including all question details');
        console.log('- Stats: Focused on correct/incorrect statistics and analytics');
        console.log('- Stats: Includes question breakdown with correct/incorrect answer text');
        console.log('- Stats: Provides overall statistics and pass rates');
        
        return {
            original: originalResponse.data,
            stats: statsResponse.data
        };
        
    } catch (error) {
        console.error('❌ Error comparing endpoints:', error.response?.data || error.message);
        throw error;
    }
}

// Usage instructions
console.log('📖 Quiz Stats API Tester');
console.log('=' .repeat(40));
console.log('This script tests the new /api/quiz/:id/stats endpoint');
console.log('which shows correct and incorrect answer statistics.');
console.log('\nUsage:');
console.log('testQuizStats("your-jwt-token-here")');
console.log('\nTo compare with original endpoint:');
console.log('compareEndpoints("your-jwt-token-here")');

// Export the functions
module.exports = { 
    testQuizStats,
    compareEndpoints
};

// Uncomment and add your token to run immediately:
// testQuizStats('YOUR_TOKEN_HERE');
// compareEndpoints('YOUR_TOKEN_HERE');
