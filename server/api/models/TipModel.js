const mongoose = require("mongoose");
const tipShema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            errorMessage: "Tip title is required"
        },

        content: {
            type: String,
            required: true,
            errorMessage: "Tip content is required"
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

const Tip = mongoose.model('Tip', tipShema);
module.exports = Tip;