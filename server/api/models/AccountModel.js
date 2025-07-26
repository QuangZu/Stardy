const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        
        username: {
            type: String,
            required: true,
            unique: true,
            errorMessage: "Account username is required"
        },

        password: {
            type: String,
            required: true,
            errorMessage: "Account password is required"
        },

        email: {
            type: String,
            required: true,
            unique: true,
            errorMessage: "Account email is required"
        },
        
        avatar: {
            type: String,
            default: null
        },
        
        completedQuestions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QA'
        }],
        
        completedExams: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam'
        }],

        createdAt: {
            type: Date,
            default: Date.now
        },
        
        updatedAt: {
            type: Date,
            default: Date.now
        },
    },
    {
        versionKey: false,
        timestamps: true
    }
)

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;