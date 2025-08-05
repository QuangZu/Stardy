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

        aiEnhanced: {
            type: Boolean,
            default: false
        },

        enhancedAt: {
            type: Date,
            default: null
        },

        sourceType: {
            type: String,
            enum: ['manual', 'youtube', 'document', 'pdf', 'audio'],
            default: 'manual'
        },

        sourceData: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        keyPoints: [{
            type: String
        }],

        tags: [{
            type: String,
            trim: true
        }],

        wordCount: {
            type: Number,
            default: 0
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

// Pre-save middleware to calculate word count and reading time
noteSchema.pre('save', function(next) {
    if (this.isModified('content')) {
        // Calculate word count
        this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;

        // Calculate reading time (average 200 words per minute)
        this.readingTime = Math.ceil(this.wordCount / 200);

        // Update date_updated
        this.date_updated = new Date();
    }
    next();
});

// Instance method to extract key points from content
noteSchema.methods.extractKeyPoints = function() {
    const content = this.content;
    const keyPointPatterns = [
        /## 🔍 Important Points to Remember\n([\s\S]*?)(?=\n##|$)/,
        /## Key Points\n([\s\S]*?)(?=\n##|$)/,
        /## 💡 Key Concepts & Definitions\n([\s\S]*?)(?=\n##|$)/
    ];

    let extractedPoints = [];

    keyPointPatterns.forEach(pattern => {
        const match = content.match(pattern);
        if (match) {
            const points = match[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
                .map(line => line.replace(/^[-*]\s*/, '').trim())
                .filter(point => point.length > 0);
            extractedPoints = extractedPoints.concat(points);
        }
    });

    return extractedPoints;
};

// Instance method to get study questions
noteSchema.methods.getStudyQuestions = function() {
    const content = this.content;
    const questionPattern = /## ❓ Study Questions\n([\s\S]*?)(?=\n##|$)/;
    const match = content.match(questionPattern);

    if (match) {
        return match[1]
            .split('\n')
            .filter(line => line.trim().match(/^\d+\./))
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(question => question.length > 0);
    }

    return [];
};

// Static method to find notes by source type
noteSchema.statics.findBySourceType = function(sourceType, userId) {
    return this.find({ sourceType, userId }).sort({ createdAt: -1 });
};

// Static method to find AI-enhanced notes
noteSchema.statics.findAIEnhanced = function(userId) {
    return this.find({ aiEnhanced: true, userId }).sort({ enhancedAt: -1 });
};

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;