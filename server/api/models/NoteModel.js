const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            errorMessage: "Note title is required"
        },

        content: {
            type: String,
            required: true,
            errorMessage: "Note content is required"
        },

        category: {
            type: String,
            default: "General",
            errorMessage: "Note category is required"
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            errorMessage: "User ID is required"
        },

        isFavorite: {
            type: Boolean,
            default: false
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

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;