const mongoose = require("mongoose");

const aiRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            errorMessage: "User ID is required"
        },

        requestType: {
            type: String,
            required: true,
            enum: [
                'chat',
                'enhance_note',
                'summarize_note',
                'generate_questions',
                'create_flashcards',
                'analyze_video',
                'explain_concept',
                'generate_quiz',
                'health_check'
            ],
            errorMessage: "Request type is required and must be valid"
        },

        inputData: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            errorMessage: "Input data is required"
        },

        outputData: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
            errorMessage: "Status must be valid"
        },

        errorMessage: {
            type: String,
            default: null
        },

        processingTime: {
            type: Number, // in milliseconds
            default: null
        },

        tokenUsage: {
            inputTokens: {
                type: Number,
                default: 0
            },
            outputTokens: {
                type: Number,
                default: 0
            },
            totalTokens: {
                type: Number,
                default: 0
            }
        },

        metadata: {
            userAgent: String,
            ipAddress: String,
            sessionId: String,
            requestId: String
        },

        relatedNoteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note',
            default: null
        },

        isSuccessful: {
            type: Boolean,
            default: false
        },

        retryCount: {
            type: Number,
            default: 0
        },

        maxRetries: {
            type: Number,
            default: 3
        }
    },
    {
        timestamps: {
            createdAt: 'date_created',
            updatedAt: 'date_updated'
        },
        collection: 'ai_requests'
    }
);

// Indexes for better query performance
aiRequestSchema.index({ userId: 1, date_created: -1 });
aiRequestSchema.index({ requestType: 1, status: 1 });
aiRequestSchema.index({ status: 1, date_created: -1 });
aiRequestSchema.index({ relatedNoteId: 1 });

// Virtual for request duration
aiRequestSchema.virtual('duration').get(function() {
    if (this.processingTime) {
        return `${this.processingTime}ms`;
    }
    return null;
});

// Virtual for success rate calculation
aiRequestSchema.virtual('successRate').get(function() {
    return this.isSuccessful ? 100 : 0;
});

// Instance methods
aiRequestSchema.methods.markAsProcessing = function() {
    this.status = 'processing';
    this.date_updated = new Date();
    return this.save();
};

aiRequestSchema.methods.markAsCompleted = function(outputData, processingTime = null) {
    this.status = 'completed';
    this.isSuccessful = true;
    this.outputData = outputData;
    this.processingTime = processingTime;
    this.date_updated = new Date();
    return this.save();
};

aiRequestSchema.methods.markAsFailed = function(errorMessage, shouldRetry = false) {
    if (shouldRetry && this.retryCount < this.maxRetries) {
        this.retryCount += 1;
        this.status = 'pending';
        this.errorMessage = errorMessage;
    } else {
        this.status = 'failed';
        this.isSuccessful = false;
        this.errorMessage = errorMessage;
    }
    this.date_updated = new Date();
    return this.save();
};

aiRequestSchema.methods.updateTokenUsage = function(inputTokens, outputTokens) {
    this.tokenUsage.inputTokens = inputTokens || 0;
    this.tokenUsage.outputTokens = outputTokens || 0;
    this.tokenUsage.totalTokens = (inputTokens || 0) + (outputTokens || 0);
    return this.save();
};

// Static methods
aiRequestSchema.statics.getRequestsByUser = function(userId, limit = 50) {
    return this.find({ userId })
        .sort({ date_created: -1 })
        .limit(limit)
        .populate('relatedNoteId', 'title category')
        .exec();
};

aiRequestSchema.statics.getRequestsByType = function(requestType, limit = 100) {
    return this.find({ requestType })
        .sort({ date_created: -1 })
        .limit(limit)
        .populate('userId', 'username email')
        .exec();
};

aiRequestSchema.statics.getFailedRequests = function(limit = 50) {
    return this.find({ status: 'failed' })
        .sort({ date_created: -1 })
        .limit(limit)
        .populate('userId', 'username email')
        .exec();
};

aiRequestSchema.statics.getSuccessRate = async function(userId = null, timeframe = null) {
    const matchConditions = {};
    
    if (userId) {
        matchConditions.userId = mongoose.Types.ObjectId(userId);
    }
    
    if (timeframe) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeframe);
        matchConditions.date_created = { $gte: startDate };
    }

    const result = await this.aggregate([
        { $match: matchConditions },
        {
            $group: {
                _id: null,
                totalRequests: { $sum: 1 },
                successfulRequests: {
                    $sum: { $cond: [{ $eq: ['$isSuccessful', true] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                totalRequests: 1,
                successfulRequests: 1,
                successRate: {
                    $cond: [
                        { $eq: ['$totalRequests', 0] },
                        0,
                        { $multiply: [{ $divide: ['$successfulRequests', '$totalRequests'] }, 100] }
                    ]
                }
            }
        }
    ]);

    return result[0] || { totalRequests: 0, successfulRequests: 0, successRate: 0 };
};

aiRequestSchema.statics.getUsageStats = async function(userId = null, timeframe = 7) {
    const matchConditions = {};
    
    if (userId) {
        matchConditions.userId = mongoose.Types.ObjectId(userId);
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);
    matchConditions.date_created = { $gte: startDate };

    const result = await this.aggregate([
        { $match: matchConditions },
        {
            $group: {
                _id: '$requestType',
                count: { $sum: 1 },
                totalTokens: { $sum: '$tokenUsage.totalTokens' },
                avgProcessingTime: { $avg: '$processingTime' },
                successCount: {
                    $sum: { $cond: [{ $eq: ['$isSuccessful', true] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                requestType: '$_id',
                count: 1,
                totalTokens: 1,
                avgProcessingTime: { $round: ['$avgProcessingTime', 2] },
                successRate: {
                    $round: [{ $multiply: [{ $divide: ['$successCount', '$count'] }, 100] }, 2]
                }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return result;
};

// Pre-save middleware
aiRequestSchema.pre('save', function(next) {
    if (this.isNew) {
        // Generate a unique request ID
        this.metadata = this.metadata || {};
        this.metadata.requestId = new mongoose.Types.ObjectId().toString();
    }
    next();
});

// Post-save middleware for logging
aiRequestSchema.post('save', function(doc) {
    console.log(`[AIModel] AI request ${doc._id} saved with status: ${doc.status}`);
});

const AIRequest = mongoose.model("AIRequest", aiRequestSchema);

module.exports = AIRequest;
