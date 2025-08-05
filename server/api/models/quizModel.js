const mongoose = require('mongoose');

// Individual question schema
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
    explanation: {
        type: String,
        default: ''
    }
}, { _id: false });

// Main quiz container schema
const QuizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            errorMessage: "Quiz title is required"
        },

        description: {
            type: String,
            default: ''
        },

        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note',
            required: false // Allow quizzes without notes
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            errorMessage: "User ID is required"
        },

        questions: [QuestionSchema], // Array of questions

        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },

        category: {
            type: String,
            default: 'General'
        },

        timeLimit: {
            type: Number,
            default: 30 // minutes
        },

        aiGenerated: {
            type: Boolean,
            default: true
        },

        generatedAt: {
            type: Date,
            default: Date.now
        },

        totalAttempts: {
            type: Number,
            default: 0
        },

        averageScore: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz;
