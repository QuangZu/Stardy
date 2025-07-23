const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            errorMessage: "Flashcard question is required"
        },

        answer: {
            type: String,
            required: true,
            errorMessage: "Flashcard answer is required"
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
)

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
module.exports = Flashcard;