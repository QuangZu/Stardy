const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            errorMessage: "User ID is required"
        },
        
        subjectProgress: [{
            subjectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject'
            },
            completionPercentage: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            questionsAnswered: {
                type: Number,
                default: 0
            },
            correctAnswers: {
                type: Number,
                default: 0
            }
        }],
        
        examHistory: [{
            examId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exam'
            },
            score: Number,
            passed: Boolean,
            dateTaken: {
                type: Date,
                default: Date.now
            },
            timeSpent: Number  // Time in seconds
        }],
        
        studyStreak: {
            currentStreak: {
                type: Number,
                default: 0
            },
            longestStreak: {
                type: Number,
                default: 0
            },
            lastStudyDate: Date
        },
        
        aiInteractions: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
module.exports = UserProgress;