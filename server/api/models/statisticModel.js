const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note',
            required: true
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },

    },
    {
        versionKey: false,
        timestamps: true
    }
)

const Statistic = mongoose.model('Statistic', statisticSchema);
module.exports = Statistic;