const mongoose = require('mongoose');

// Individual card schema
const CardSchema = new mongoose.Schema({
    front: {
        type: String,
        required: true
    },
    back: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }]
}, { _id: false });

// Main flashcard set container schema
const FlashcardSetSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            errorMessage: "Flashcard set title is required"
        },

        description: {
            type: String,
            default: ''
        },

        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note',
            required: false // Allow flashcards without notes
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            errorMessage: "User ID is required"
        },

        cards: [CardSchema], // Array of cards

        category: {
            type: String,
            default: 'General'
        },

        isActive: {
            type: Boolean,
            default: true
        },

        aiGenerated: {
            type: Boolean,
            default: true
        },

        generatedAt: {
            type: Date,
            default: Date.now
        },

        totalStudySessions: {
            type: Number,
            default: 0
        },

        averageSessionTime: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

const FlashcardSet = mongoose.model('FlashcardSet', FlashcardSetSchema);
module.exports = FlashcardSet;
