const mongoose = require("mongoose");
const scheduleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            errorMessage: "Schedule title is required"
        },

        description: {
            type: String,
            required: true,
            errorMessage: "Schedule description is required"
        },

        status: {
            type: String,
            required: true,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
            errorMessage: "Schedule status is required and must be one of 'pending', 'in-progress', or 'completed'"
        },

        date: {
            type: Date,
            required: true,
            errorMessage: "Schedule date is required"
        },

        time: {
            type: String,
            required: true,
            errorMessage: "Schedule time is required"
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            errorMessage: "User ID is required"
        },

        type: {
            type: String,
            enum: ["study", "exam", "lab", "meeting", "other"],
            default: "study",
            errorMessage: "Schedule type must be one of 'study', 'exam', 'lab', 'meeting', or 'other'"
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
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
