const mongoose = require('mongoose');

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
            required: true,
            errorMessage: "Note ID is required"
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            errorMessage: "User ID is required"
        },

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
        },

        aiGenerated: {
            type: Boolean,
            default: true
        },

        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz;
