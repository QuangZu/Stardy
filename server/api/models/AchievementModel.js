const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            errorMessage: "Achievement name is required"
        },
        
        description: {
            type: String,
            required: true,
            errorMessage: "Achievement description is required"
        },
        
        icon: {
            type: String,
            required: true,
            errorMessage: "Achievement icon is required"
        },
        
        experiencePoints: {
            type: Number,
            required: true,
            default: 50,
            errorMessage: "Experience points are required"
        },
        
        requirements: {
            type: Object,
            required: true,
            errorMessage: "Achievement requirements are required"
        },
        
        category: {
            type: String,
            enum: ['learning', 'participation', 'mastery', 'special'],
            required: true,
            errorMessage: "Achievement category is required"
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const Achievement = mongoose.model('Achievement', achievementSchema);
module.exports = Achievement;