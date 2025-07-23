const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            errorMessage: "Reward name is required"
        },
        
        description: {
            type: String,
            required: true,
            errorMessage: "Reward description is required"
        },
        
        type: {
            type: String,
            enum: ['theme', 'avatar', 'feature', 'content', 'badge'],
            required: true,
            errorMessage: "Reward type is required"
        },
        
        unlockRequirement: {
            type: Object,
            required: true,
            errorMessage: "Unlock requirement is required"
        },
        
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            errorMessage: "Reward value is required"
        },
        
        rarity: {
            type: String,
            enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
            default: 'common',
            errorMessage: "Reward rarity is required"
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const Reward = mongoose.model('Reward', rewardSchema);
module.exports = Reward;