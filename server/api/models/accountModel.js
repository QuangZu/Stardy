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
            required: function() {
                return !this.googleId;
            },
            errorMessage: "Account password is required"
        },

        email: {
            type: String,
            required: true,
            unique: true,
            errorMessage: "Account email is required"
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
            default: undefined
        },

        provider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local'
        },

        profilePicture: {
            type: String,
            default: null
        },

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        avatar: {
            type: String,
            default: null
        },
        
        completedQuizzes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
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