const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            errorMessage: "Subject name is required"
        },
        category: {
            type: String,
            required: true,
            enum: ['primary', 'secondary', 'senior secondary', 'university', 'special'],
            errorMessage: "Subject category is required"
        },
        icon: {
            type: String,
            default: 'fas fa-book'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;