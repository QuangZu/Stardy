const mongoose = require("mongoose");
const levelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            errorMessage: "Level name is required"
        },

        description: {
            type: String,
            required: true,
            errorMessage: "Level description is required"
        },
        
        level: {
            type: Number,
            required: true,
            unique: true,
            min: 1,
            errorMessage: "Level number is required"
        },
        
        experienceRequired: {
            type: Number,
            required: true,
            min: 0,
            errorMessage: "Experience required is required"
        },
        
        rewards: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reward'
        }],
        
        isBossLevel: {
            type: Boolean,
            default: false
        },
        
        bossExam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam'
        },
        
        unlockRequirements: {
            type: Object,
            default: {}
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const Level = mongoose.model('Level', levelSchema);
module.exports = Level;
