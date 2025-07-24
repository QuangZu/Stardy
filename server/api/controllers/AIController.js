const AI = require('../models/AIModel');
const UserProgress = require('../models/UserProgressModel');
const EnhancedStudyAssistant = require('../ai/enhancedStudyAssistant');
const IntentParser = require('../ai/enhancedStudyAssistant');
const RecommendationService = require('../ai/recommendService');
const { authenticate } = require('../middlewares/auth');

// Initialize enhanced AI services
const studyAssistant = new EnhancedStudyAssistant();
const intentParser = new IntentParser();
const recommendationService = new RecommendationService();

// Enhanced chatbot with comprehensive study assistance
const enhancedChatbot = async (req, res) => {
    try {
        const { message, context = {} } = req.body;
        const userId = req.user.id;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Add request context (current page, subject, question, etc.)
        const enhancedContext = {
            ...context,
            timestamp: new Date(),
            userAgent: req.headers['user-agent'],
            sessionId: req.sessionID
        };

        // Process query with enhanced study assistant
        const response = await studyAssistant.processStudentQuery(
            message, 
            userId, 
            enhancedContext
        );

        // Log the interaction with enhanced metadata
        await logEnhancedInteraction(userId, message, response, enhancedContext);

        // Prepare comprehensive response
        const chatResponse = {
            success: true,
            message: response.response,
            type: response.type,
            confidence: response.confidence || 0.8,
            
            // Enhanced response components
            hints: response.hints || [],
            relatedConcepts: response.relatedConcepts || [],
            studySuggestions: response.studySuggestions || [],
            keyPoints: response.keyPoints || [],
            examples: response.examples || [],
            
            // System integration
            actionLinks: response.actionLinks || [],
            systemSuggestions: response.systemSuggestions || [],
            navigationLinks: response.navigationLinks || [],
            
            // Learning support
            nextSteps: response.nextSteps || [],
            prerequisites: response.prerequisiteCheck || [],
            milestones: response.milestones || [],
            
            // Metadata
            timestamp: new Date().toISOString(),
            userId: userId,
            conversationId: generateConversationId(userId, enhancedContext)
        };

        res.json(chatResponse);

    } catch (error) {
        console.error('Enhanced chatbot error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to process your message at this time',
            fallbackResponse: await studyAssistant.generateFallbackResponse(
                req.body.message || '', 
                req.user.id
            )
        });
    }
};

// Question-specific help endpoint
const getQuestionHelp = async (req, res) => {
    try {
        const { questionId, userQuery, currentAnswer } = req.body;
        const userId = req.user.id;

        const context = {
            currentQuestion: questionId,
            userAnswer: currentAnswer,
            requestType: 'question_help'
        };

        const help = await studyAssistant.handleQuestionHelp(
            userQuery || "Help me understand this question",
            await studyAssistant.getEnhancedUserContext(userId),
            context
        );

        res.json({
            success: true,
            ...help,
            questionId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Question help error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to provide question help at this time'
        });
    }
};

// Concept explanation endpoint
const explainConcept = async (req, res) => {
    try {
        const { concept, subject, difficulty } = req.body;
        const userId = req.user.id;

        const context = {
            subject,
            difficulty,
            requestType: 'concept_explanation'
        };

        const explanation = await studyAssistant.handleConceptExplanation(
            `Explain ${concept}`,
            await studyAssistant.getEnhancedUserContext(userId),
            context
        );

        res.json({
            success: true,
            ...explanation,
            concept,
            subject,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Concept explanation error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to explain concept at this time'
        });
    }
};

// Personalized study plan generation
const generateStudyPlan = async (req, res) => {
    try {
        const { goals, timeAvailable, subjects, deadline } = req.body;
        const userId = req.user.id;

        const planQuery = `Create a study plan for: ${goals}. Available time: ${timeAvailable}. Subjects: ${subjects?.join(', ')}. Deadline: ${deadline}`;

        const context = {
            goals,
            timeAvailable,
            subjects,
            deadline,
            requestType: 'study_planning'
        };

        const studyPlan = await studyAssistant.handleStudyPlanning(
            planQuery,
            await studyAssistant.getEnhancedUserContext(userId),
            context
        );

        res.json({
            success: true,
            ...studyPlan,
            planMetadata: {
                goals,
                timeAvailable,
                subjects,
                deadline,
                createdAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Study plan generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to generate study plan at this time'
        });
    }
};

// Progress analysis and insights
const analyzeProgress = async (req, res) => {
    try {
        const { timeframe = 'week', subjects = [] } = req.query;
        const userId = req.user.id;

        const analysisQuery = `Analyze my progress over the last ${timeframe}${subjects.length ? ` in ${subjects.join(', ')}` : ''}`;

        const context = {
            timeframe,
            subjects,
            requestType: 'progress_inquiry'
        };

        const analysis = await studyAssistant.handleProgressInquiry(
            analysisQuery,
            await studyAssistant.getEnhancedUserContext(userId),
            context
        );

        res.json({
            success: true,
            ...analysis,
            analysisMetadata: {
                timeframe,
                subjects,
                analyzedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Progress analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to analyze progress at this time'
        });
    }
};

// Smart exam preparation
const prepareForExam = async (req, res) => {
    try {
        const { examId, subject, timeUntilExam, currentPreparation } = req.body;
        const userId = req.user.id;

        const prepQuery = `Help me prepare for my ${subject} exam in ${timeUntilExam}. Current preparation: ${currentPreparation}`;

        const context = {
            examId,
            subject,
            timeUntilExam,
            currentPreparation,
            requestType: 'exam_preparation'
        };

        const preparation = await studyAssistant.handleExamPreparation(
            prepQuery,
            await studyAssistant.getEnhancedUserContext(userId),
            context
        );

        res.json({
            success: true,
            ...preparation,
            examMetadata: {
                examId,
                subject,
                timeUntilExam,
                preparedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Exam preparation error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to prepare exam strategy at this time'
        });
    }
};

// Learning analytics and insights
const getLearningInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const userData = await studyAssistant.getEnhancedUserContext(userId);

        const insights = {
            learningProfile: userData.learningProfile,
            performanceTrends: userData.performanceTrends,
            currentWeaknesses: userData.currentWeaknesses,
            studyGoals: userData.studyGoals,
            recommendations: await recommendationService.getPersonalizedRecommendations(userId),
            sessionData: userData.currentSession
        };

        res.json({
            success: true,
            insights,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Learning insights error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to generate learning insights at this time'
        });
    }
};

// System health and capabilities check
const getSystemCapabilities = async (req, res) => {
    try {
        const capabilities = {
            studyAssistance: {
                questionHelp: true,
                conceptExplanation: true,
                studyPlanning: true,
                progressAnalysis: true,
                examPreparation: true,
                learningInsights: true
            },
            systemIntegration: {
                navigation: true,
                dataAccess: true,
                userContext: true,
                realTimeHelp: true
            },
            aiFeatures: {
                conversationMemory: true,
                personalizedResponses: true,
                contextAwareness: true,
                multiTurnConversations: true
            }
        };

        // Test AI service availability
        const healthCheck = await studyAssistant.processStudentQuery(
            "health check",
            req.user?.id || 'test',
            { test: true }
        );

        res.json({
            success: true,
            capabilities,
            status: healthCheck ? 'operational' : 'degraded',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('System capabilities error:', error);
        res.status(500).json({
            success: false,
            status: 'error',
            error: error.message
        });
    }
};

// Helper functions
async function logEnhancedInteraction(userId, message, response, context) {
    try {
        const enhancedLog = new AI({
            userId,
            request: message,
            response: response.response || JSON.stringify(response),
            metadata: {
                responseType: response.type,
                confidence: response.confidence,
                context: context,
                timestamp: new Date()
            }
        });

        await enhancedLog.save();

        // Update user progress with AI interaction
        const userProgress = await UserProgress.findOne({ userId });
        if (userProgress) {
            userProgress.aiInteractions += 1;
            userProgress.lastAIInteraction = new Date();
            await userProgress.save();
        }

    } catch (error) {
        console.error('Error logging enhanced interaction:', error);
    }
}

function generateConversationId(userId, context) {
    return `${userId}_${context.sessionId || 'session'}_${Date.now()}`;
}

// Export all functions
module.exports = {
    // Enhanced chatbot functions
    enhancedChatbot,
    getQuestionHelp,
    explainConcept,
    generateStudyPlan,
    analyzeProgress,
    prepareForExam,
    getLearningInsights,
    getSystemCapabilities,
    
    // Existing functions (maintain backward compatibility)
    chatbot: enhancedChatbot, // Alias for backward compatibility
    getRecommendations: async (req, res) => {
        // Wrap existing recommendation service
        try {
            const userId = req.user.id;
            const { context, subject } = req.query;
            
            const recommendations = await recommendationService.getPersonalizedRecommendations(
                userId, 
                { page: context, currentSubject: subject }
            );
            
            res.json({
                success: true,
                ...recommendations,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Unable to generate recommendations'
            });
        }
    },
    
    // Keep existing functions for backward compatibility
    getAllAIRequests: async (req, res) => {
        try {
            const aiRequests = await AI.find().populate('userId', 'username email');
            res.status(200).json(aiRequests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    
    getAIRequestsByUser: async (req, res) => {
        try {
            const aiRequests = await AI.find({ userId: req.user.id });
            res.status(200).json(aiRequests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};