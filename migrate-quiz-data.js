// Migration script to add incorrectAnswer field to existing quizzes
// This should be run on the server side with direct database access

const mongoose = require('mongoose');

// Quiz schema (copy from the model)
const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true
    },
    incorrectAnswer: {
        type: Number,
        required: false
    },
    explanation: {
        type: String,
        default: ''
    }
}, { _id: false });

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    questions: [QuestionSchema],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    category: { type: String, default: 'General' },
    timeLimit: { type: Number, default: 30 },
    aiGenerated: { type: Boolean, default: true },
    generatedAt: { type: Date, default: Date.now },
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
}, {
    versionKey: false,
    timestamps: true
});

const Quiz = mongoose.model('Quiz', QuizSchema);

async function migrateQuizData() {
    try {
        console.log('🚀 Starting quiz data migration...');
        
        // Connect to MongoDB (you'll need to set your connection string)
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');
        
        // Find all quizzes that don't have incorrectAnswer field in their questions
        const quizzesToUpdate = await Quiz.find({
            'questions.incorrectAnswer': { $exists: false }
        });
        
        console.log(`📊 Found ${quizzesToUpdate.length} quizzes that need migration`);
        
        let updatedCount = 0;
        
        for (const quiz of quizzesToUpdate) {
            console.log(`\n🔄 Processing quiz: ${quiz.title} (ID: ${quiz._id})`);
            
            let hasChanges = false;
            
            // Update each question to add incorrectAnswer field
            quiz.questions.forEach((question, index) => {
                if (question.incorrectAnswer === undefined || question.incorrectAnswer === null) {
                    // Set incorrectAnswer to a different option than correctAnswer
                    const totalOptions = question.options.length;
                    let incorrectAnswer = question.correctAnswer;
                    
                    // Find a different option index
                    while (incorrectAnswer === question.correctAnswer) {
                        incorrectAnswer = Math.floor(Math.random() * totalOptions);
                    }
                    
                    question.incorrectAnswer = incorrectAnswer;
                    hasChanges = true;
                    
                    console.log(`  - Question ${index + 1}: Set incorrectAnswer to ${incorrectAnswer} (correct: ${question.correctAnswer})`);
                }
            });
            
            if (hasChanges) {
                await quiz.save();
                updatedCount++;
                console.log(`  ✅ Updated quiz: ${quiz.title}`);
            } else {
                console.log(`  ⏭️  Quiz already has incorrectAnswer fields`);
            }
        }
        
        console.log(`\n🎉 Migration completed!`);
        console.log(`📊 Updated ${updatedCount} quizzes`);
        
        // Verify the migration
        const verificationQuizzes = await Quiz.find({
            'questions.incorrectAnswer': { $exists: false }
        });
        
        if (verificationQuizzes.length === 0) {
            console.log('✅ Verification passed: All quizzes now have incorrectAnswer fields');
        } else {
            console.log(`⚠️  Verification failed: ${verificationQuizzes.length} quizzes still missing incorrectAnswer fields`);
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Function to check migration status without making changes
async function checkMigrationStatus() {
    try {
        console.log('🔍 Checking migration status...');
        
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';
        await mongoose.connect(mongoURI);
        
        const totalQuizzes = await Quiz.countDocuments();
        const quizzesWithoutIncorrectAnswer = await Quiz.countDocuments({
            'questions.incorrectAnswer': { $exists: false }
        });
        const quizzesWithIncorrectAnswer = totalQuizzes - quizzesWithoutIncorrectAnswer;
        
        console.log('📊 Migration Status:');
        console.log(`- Total quizzes: ${totalQuizzes}`);
        console.log(`- Quizzes with incorrectAnswer: ${quizzesWithIncorrectAnswer}`);
        console.log(`- Quizzes without incorrectAnswer: ${quizzesWithoutIncorrectAnswer}`);
        console.log(`- Migration progress: ${Math.round((quizzesWithIncorrectAnswer / totalQuizzes) * 100)}%`);
        
        if (quizzesWithoutIncorrectAnswer === 0) {
            console.log('✅ All quizzes have been migrated!');
        } else {
            console.log('⚠️  Migration needed for some quizzes');
        }
        
    } catch (error) {
        console.error('❌ Status check failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Usage instructions
console.log('📖 Quiz Data Migration Tool');
console.log('=' .repeat(40));
console.log('This script adds the incorrectAnswer field to existing quizzes.');
console.log('\nFunctions:');
console.log('- migrateQuizData(): Migrate all quizzes');
console.log('- checkMigrationStatus(): Check current status');
console.log('\nMake sure to set MONGODB_URI environment variable!');

module.exports = {
    migrateQuizData,
    checkMigrationStatus
};

// Uncomment to run migration:
// migrateQuizData();

// Uncomment to check status:
// checkMigrationStatus();
