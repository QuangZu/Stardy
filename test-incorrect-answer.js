const axios = require('axios');

const backendURL = 'https://stardy-3old.onrender.com/api';
const quizId = '68915d8afb3500752de068e1';

// Test function to check if incorrectAnswer field is present
async function testIncorrectAnswerField(token) {
    try {
        console.log('🔍 Testing Quiz for incorrectAnswer field...');
        console.log('=' .repeat(50));
        
        // Get the quiz data
        const response = await axios.get(`${backendURL}/quiz/${quizId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const quiz = response.data;
        console.log('✅ Quiz retrieved successfully!');
        console.log(`📋 Quiz: ${quiz.title}`);
        console.log(`📝 Total Questions: ${quiz.questions?.length || 0}`);
        
        if (quiz.questions && quiz.questions.length > 0) {
            console.log('\n🔍 Checking questions for incorrectAnswer field...');
            
            quiz.questions.forEach((question, index) => {
                console.log(`\nQuestion ${index + 1}:`);
                console.log(`- Question: ${question.question.substring(0, 60)}...`);
                console.log(`- Options: ${question.options?.length || 0} options`);
                console.log(`- Correct Answer: ${question.correctAnswer}`);
                console.log(`- Incorrect Answer: ${question.incorrectAnswer !== undefined ? question.incorrectAnswer : 'NOT SET'}`);
                console.log(`- Has Explanation: ${question.explanation ? 'Yes' : 'No'}`);
                
                // Check if incorrectAnswer field exists and is valid
                if (question.incorrectAnswer !== undefined && question.incorrectAnswer !== null) {
                    console.log(`  ✅ incorrectAnswer field is present: ${question.incorrectAnswer}`);
                } else {
                    console.log(`  ⚠️  incorrectAnswer field is missing or null`);
                }
            });
            
            // Summary
            const questionsWithIncorrectAnswer = quiz.questions.filter(q => 
                q.incorrectAnswer !== undefined && q.incorrectAnswer !== null
            ).length;
            
            console.log('\n📊 Summary:');
            console.log(`- Questions with incorrectAnswer field: ${questionsWithIncorrectAnswer}/${quiz.questions.length}`);
            console.log(`- Percentage: ${Math.round((questionsWithIncorrectAnswer / quiz.questions.length) * 100)}%`);
            
            if (questionsWithIncorrectAnswer === 0) {
                console.log('\n⚠️  This quiz was created before the incorrectAnswer field was added.');
                console.log('   New quizzes generated after the update will include this field.');
            } else if (questionsWithIncorrectAnswer === quiz.questions.length) {
                console.log('\n✅ All questions have the incorrectAnswer field! The update is working.');
            } else {
                console.log('\n⚠️  Some questions are missing the incorrectAnswer field.');
            }
        } else {
            console.log('⚠️  No questions found in this quiz.');
        }
        
        return quiz;
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('🔐 Authentication failed. Make sure your token is valid.');
        } else if (error.response?.status === 404) {
            console.log('🔍 Quiz not found. Check the quiz ID.');
        }
        
        throw error;
    }
}

// Test function to generate a new quiz and check if it has incorrectAnswer
async function testNewQuizGeneration(token, noteId, userId) {
    try {
        console.log('\n🚀 Testing New Quiz Generation...');
        console.log('=' .repeat(50));
        
        const response = await axios.post(`${backendURL}/quiz/generate`, {
            noteId: noteId,
            userId: userId,
            difficulty: 'medium',
            questionCount: 3
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ New quiz generated successfully!');
        const newQuiz = response.data.quiz;
        
        console.log(`📋 New Quiz: ${newQuiz.title}`);
        console.log(`📝 Questions: ${newQuiz.questions?.length || 0}`);
        
        if (newQuiz.questions && newQuiz.questions.length > 0) {
            console.log('\n🔍 Checking new quiz questions for incorrectAnswer field...');
            
            newQuiz.questions.forEach((question, index) => {
                console.log(`\nNew Question ${index + 1}:`);
                console.log(`- Correct Answer: ${question.correctAnswer}`);
                console.log(`- Incorrect Answer: ${question.incorrectAnswer !== undefined ? question.incorrectAnswer : 'NOT SET'}`);
                
                if (question.incorrectAnswer !== undefined && question.incorrectAnswer !== null) {
                    console.log(`  ✅ NEW quiz has incorrectAnswer field: ${question.incorrectAnswer}`);
                } else {
                    console.log(`  ❌ NEW quiz is missing incorrectAnswer field`);
                }
            });
            
            const newQuestionsWithIncorrectAnswer = newQuiz.questions.filter(q => 
                q.incorrectAnswer !== undefined && q.incorrectAnswer !== null
            ).length;
            
            console.log('\n📊 New Quiz Summary:');
            console.log(`- Questions with incorrectAnswer: ${newQuestionsWithIncorrectAnswer}/${newQuiz.questions.length}`);
            
            if (newQuestionsWithIncorrectAnswer === newQuiz.questions.length) {
                console.log('🎉 SUCCESS! New quizzes now include the incorrectAnswer field!');
            } else {
                console.log('⚠️  The update may not be working properly for new quizzes.');
            }
        }
        
        return newQuiz;
        
    } catch (error) {
        console.error('❌ New quiz generation failed:', error.response?.data || error.message);
        console.log('ℹ️  This might be expected if you don\'t have a valid noteId or userId.');
        return null;
    }
}

// Usage instructions
console.log('📖 Incorrect Answer Field Tester');
console.log('=' .repeat(40));
console.log('This script tests:');
console.log('1. Whether existing quizzes have the incorrectAnswer field');
console.log('2. Whether new quizzes will include the incorrectAnswer field');
console.log('\nUsage:');
console.log('testIncorrectAnswerField("your-jwt-token-here")');
console.log('\nTo test new quiz generation:');
console.log('testNewQuizGeneration("token", "noteId", "userId")');

// Export the functions
module.exports = { 
    testIncorrectAnswerField,
    testNewQuizGeneration
};

// Uncomment and add your token to run immediately:
// testIncorrectAnswerField('YOUR_TOKEN_HERE');
