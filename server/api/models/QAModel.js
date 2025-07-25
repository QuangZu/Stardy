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

        subjectName: {
            type: String,
            ref: 'Subject',
            required: true,
            errorMessage: "Subject name is required"
        },
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const QA = mongoose.model('QA', QASchema);
module.exports = QA;