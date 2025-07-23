const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            errorMessage: "Question name is required"
        },

        question_content: {
            type: String,
            required: true,
            errorMessage: "Question content is required"
        },

        options: {
            type: [String],
            required: true,
            errorMessage: "Question options are required"
        },

        correct_answer: {
            type: String,
            required: true,
            errorMessage: "Correct answer is required"
        },

        date_created: {
            type: Date,
            default: Date.now,
            errorMessage: "Date created is required"
        },

        date_updated: {
            type: Date,
            default: Date.now,
            errorMessage: "Date updated is required"
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;