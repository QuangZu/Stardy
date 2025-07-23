const AI = require('../models/AIModel');
const UserProgress = require('../models/UserProgressModel');
const IntentParser = require('../ai/intentParser');
const RecommendationService = require('../ai/recommendService');
const { authenticate } = require('../middlewares/auth');

// Initialize AI services
const intentParser = new IntentParser();
const recommendationService = new RecommendationService();

// Existing AI request logging functionality
const getAllAIRequests = async (req, res) => {
    try {
        const aiRequests = await AI.find().populate('userId', 'name email');
        res.status(200).json(aiRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAIRequestsByUser = async (req, res) => {
    try {
        const aiRequests = await AI.find({ userId: req.user.id }).populate('userId', 'name email');
        res.status(200).json(aiRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAIRequest = async (req, res) => {
    try {
        const { request, response } = req.body;
        const userId = req.user.id;
        
        // Create new AI request log
        const newAIRequest = new AI({
            userId,
            request,
            response
        });
        
        const savedAIRequest = await newAIRequest.save();
        
        // Update user progress - increment AI interactions
        const userProgress = await UserProgress.findOne({ userId });
        if (userProgress) {
            userProgress.aiInteractions += 1;
            await userProgress.save();
            
            // Check for AI interaction achievements
            await checkAIInteractionAchievements(userId, userProgress.aiInteractions);
        }
        
        res.status(201).json(savedAIRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Chatbot
const chatbot = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Parse user intent and generate response
        const response = await intentParser.parseIntent(message, userId);

        // Log the interaction
        try {
            await createAIRequest({
                user: { id: userId },
                body: { request: message, response: response.response }
            }, { status: () => ({ json: () => {} }) });
        } catch (logError) {
            console.error('Error logging AI interaction:', logError);
        }

        // Add timestamp and user context
        const chatResponse = {
            success: true,
            message: response.response,
            intent: response.intent,
            confidence: response.confidence,
            navigationLinks: response.navigationLinks || [],
            suggestedActions: response.suggestedActions || [],
            timestamp: new Date().toISOString(),
            userId: userId
        };

        res.json(chatResponse);

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to process your message at this time',
            fallbackMessage: 'I\'m sorry, I\'m having trouble understanding right now. Please try again later.'
        });
    }
};

// Get personalized learning recommendations
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { context, subject } = req.query;

        const requestContext = {
            page: context || 'general',
            currentSubject: subject
        };

        const recommendations = await recommendationService.getPersonalizedRecommendations(
            userId, 
            requestContext
        );

        res.json({
            success: true,
            ...recommendations,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to generate recommendations at this time',
            recommendations: recommendationService.getFallbackRecommendations()
        });
    }
};

// Get exam-specific recommendations for the learning page
const getExamRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject } = req.query;

        const recommendations = await recommendationService.getExamRecommendations(
            userId, 
            subject
        );

        res.json({
            success: true,
            ...recommendations,
            timestamp: new Date().toISOString(),
            context: 'exam_preparation'
        });

    } catch (error) {
        console.error('Exam recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to generate exam recommendations',
            recommendations: recommendationService.getFallbackRecommendations()
        });
    }
};

// Get contextual help based on current user state
const getContextualHelp = async (req, res) => {
    try {
        const userId = req.user.id;
        const { intent, page } = req.query;

        const helpResponse = await intentParser.getContextualHelp(intent || 'general', userId);

        res.json({
            success: true,
            help: helpResponse,
            intent: intent || 'general',
            page: page || 'unknown',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Contextual help error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to provide help at this time',
            help: 'I\'m here to help! You can ask me about navigation, learning resources, or your progress.'
        });
    }
};

// Get user analytics for AI services
const getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        const analytics = await recommendationService.getUserAnalytics(userId);

        res.json({
            success: true,
            analytics,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('User analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to retrieve analytics at this time'
        });
    }
};

// Health check for AI services
const healthCheck = async (req, res) => {
    try {
        // Test both services
        const testUserId = req.user?.id || 'test';
        
        // Quick test of intent parser
        const intentTest = await intentParser.parseIntent('hello', testUserId);
        
        // Quick test of recommendation service
        const recTest = await recommendationService.getFallbackRecommendations();

        res.json({
            success: true,
            status: 'healthy',
            services: {
                intentParser: intentTest ? 'operational' : 'error',
                recommendationService: recTest ? 'operational' : 'error'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI health check error:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Helper function to check for AI interaction achievements
const checkAIInteractionAchievements = async (userId, interactionCount) => {
    try {
        // Milestone interactions that should trigger achievements
        const interactionMilestones = [1, 10, 50, 100, 500];
        
        // Check if current interaction count matches any milestone
        const milestone = interactionMilestones.find(m => m === interactionCount);
        if (!milestone) return;
        
        const Achievement = require('../models/AchievementModel');
        const Account = require('../models/AccountModel');
        const user = await Account.findById(userId);
        
        // Find AI interaction achievement for this milestone
        const achievement = await Achievement.findOne({
            'requirements.type': 'aiInteraction',
            'requirements.count': milestone
        });
        
        if (achievement && !user.achievements.includes(achievement._id)) {
            // Unlock achievement
            user.achievements.push(achievement._id);
            user.experience += achievement.experiencePoints;
            await user.save();
            
            // Check if user leveled up
            await checkLevelUp(user);
        }
    } catch (error) {
        console.error("Error checking AI interaction achievements:", error);
    }
};

// Helper function to check if user leveled up
const checkLevelUp = async (user) => {
    try {
        const Level = require('../models/LevelModel');
        
        // Get the next level
        const nextLevel = await Level.findOne({ level: user.currentLevel + 1 });
        
        // If there's no next level, user is at max level
        if (!nextLevel) {
            return { leveledUp: false };
        }
        
        // Check if user has enough XP to level up
        if (user.experience >= nextLevel.experienceRequired) {
            user.currentLevel += 1;
            await user.save();
            return { leveledUp: true, newLevel: user.currentLevel };
        }
        
        return { leveledUp: false };
    } catch (error) {
        console.error("Error checking level up:", error);
        return { leveledUp: false };
    }
};

module.exports = {
    // Existing functionality
    getAllAIRequests,
    getAIRequestsByUser,
    createAIRequest,
    
    // New AI functionality
    chatbot,
    getRecommendations,
    getExamRecommendations,
    getContextualHelp,
    getUserAnalytics,
    healthCheck
};