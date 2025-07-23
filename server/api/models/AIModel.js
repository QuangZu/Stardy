const mongoose = require('mongoose');

const aiSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            errorMessage: "User ID is required"
        },
        request: {
            text: String,
            image: String,
            type: {
                type: String,
                enum: ['text', 'image', 'mixed'],
                default: 'text'
            }
        },
        response: {
            text: String,
            image: String,
            type: {
                type: String,
                enum: ['text', 'image', 'mixed'],
                default: 'text'
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const AI = mongoose.model('AI', aiSchema);
module.exports = AI;
