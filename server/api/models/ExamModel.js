const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            errorMessage: "Exam title is required"
        },
        
        description: {
            type: String,
            required: true,
            errorMessage: "Exam description is required"
        },
        
        questions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QA',
            required: true
        }],
        
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        
        levelRequired: {
            type: Number,
            required: true,
            min: 1,
            errorMessage: "Level required is required"
        },
        
        timeLimit: {
            type: Number,  // Time in minutes
            default: 30
        },
        
        passingScore: {
            type: Number,  // Percentage required to pass
            required: true,
            min: 0,
            max: 100,
            default: 70,
            errorMessage: "Passing score is required"
        },
        
        experienceReward: {
            type: Number,
            required: true,
            default: 100,
            errorMessage: "Experience reward is required"
        },
        
        rewards: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reward'
        }],
        
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'boss'],
            default: 'medium',
            errorMessage: "Difficulty is required"
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;