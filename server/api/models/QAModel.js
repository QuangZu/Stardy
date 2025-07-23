const mongoose = require('mongoose');

const QASchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            errorMessage: "Question is required"
        },

        answer: {
            type: String,
            required: true,
            errorMessage: "Answer is required"
        },

        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
            errorMessage: "Subject ID is required"
        },

        levelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Level',
            required: true,
            errorMessage: "Level ID is required"
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const QA = mongoose.model('QA', QASchema);
module.exports = QA;