const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        theme: {
            type: String,
            required: true,
            default: "light",
            enum: ["light", "dark"],
            errorMessage: "Theme is required and must be either 'light' or 'dark'"
        },

        language: {
            type: String,
            required: true,
            default: "English",
            errorMessage: "Language is required"
        },

        notifications: {
            type: Boolean,
            required: true,
            default: true,
            errorMessage: "Notifications setting is required"
        },
    }
)

const Setting = mongoose.model("Setting", settingSchema);
module.exports = Setting;