const AIController = require('../controllers/AIController');
const { authenticate, requireRole } = require('../middlewares/auth');

const EnhancedAIRouter = (app) => {
    // ===========================================
    // ENHANCED AI CHATBOT ROUTES
    // ===========================================
    
    // Main enhanced chatbot endpoint
    app.route('/api/ai/chat')
        .post(authenticate, AIController.enhancedChatbot);
    
    // Question-specific help
    app.route('/api/ai/question/help')
        .post(authenticate, AIController.getQuestionHelp);
    
    // Concept explanation
    app.route('/api/ai/concept/explain')
        .post(authenticate, AIController.explainConcept);
    
    // Study plan generation
    app.route('/api/ai/study/plan')
        .post(authenticate, AIController.generateStudyPlan);
    
    // Progress analysis
    app.route('/api/ai/progress/analyze')
        .get(authenticate, AIController.analyzeProgress);
    
    // Exam preparation assistance
    app.route('/api/ai/exam/prepare')
        .post(authenticate, AIController.prepareForExam);
    
    // Learning insights and analytics
    app.route('/api/ai/insights')
        .get(authenticate, AIController.getLearningInsights);
    
    // ===========================================
    // STUDY ASSISTANCE ENDPOINTS
    // ===========================================
    
    // Get hints for current question
    app.route('/api/ai/hints/:questionId')
        .get(authenticate, async (req, res) => {
            try {
                const { questionId } = req.params;
                const { userAnswer } = req.query;
                
                const hintRequest = {
                    body: {
                        questionId,
                        userQuery: "Can you give me a hint for this question?",
                        currentAnswer: userAnswer
                    },
                    user: req.user
                };
                
                await AIController.getQuestionHelp(hintRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to generate hints'
                });
            }
        });
    
    // Explain wrong answers
    app.route('/api/ai/explain/answer')
        .post(authenticate, async (req, res) => {
            try {
                const { questionId, userAnswer, correctAnswer, explanation } = req.body;
                
                const explanationRequest = {
                    body: {
                        questionId,
                        userQuery: `Why is my answer "${userAnswer}" wrong when the correct answer is "${correctAnswer}"?`,
                        currentAnswer: userAnswer
                    },
                    user: req.user
                };
                
                await AIController.getQuestionHelp(explanationRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to explain answer'
                });
            }
        });
    
    // Get subject-specific study tips
    app.route('/api/ai/tips/:subject')
        .get(authenticate, async (req, res) => {
            try {
                const { subject } = req.params;
                const { difficulty, topic } = req.query;
                
                const tipsRequest = {
                    body: {
                        concept: topic || subject,
                        subject,
                        difficulty: difficulty || 'medium'
                    },
                    user: req.user
                };
                
                await AIController.explainConcept(tipsRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to generate study tips'
                });
            }
        });
    
    // ===========================================
    // PERSONALIZED LEARNING ROUTES
    // ===========================================
    
    // Get personalized recommendations (enhanced)
    app.route('/api/ai/recommendations')
        .get(authenticate, AIController.getRecommendations);
    
    // Get learning path suggestions
    app.route('/api/ai/learning-path')
        .post(authenticate, async (req, res) => {
            try {
                const { currentLevel, subjects, goals, timeline } = req.body;
                
                const pathRequest = {
                    body: {
                        goals: `Create a learning path for: ${goals}`,
                        timeAvailable: timeline,
                        subjects: subjects,
                        deadline: timeline
                    },
                    user: req.user
                };
                
                await AIController.generateStudyPlan(pathRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to generate learning path'
                });
            }
        });
    
    // Get weakness analysis and improvement suggestions
    app.route('/api/ai/weakness/analysis')
        .get(authenticate, async (req, res) => {
            try {
                const analysisRequest = {
                    query: {
                        timeframe: 'month',
                        subjects: []
                    },
                    user: req.user
                };
                
                await AIController.analyzeProgress(analysisRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to analyze weaknesses'
                });
            }
        });
    
    // ===========================================
    // REAL-TIME STUDY ASSISTANCE
    // ===========================================
    
    // Get real-time study session help
    app.route('/api/ai/session/help')
        .post(authenticate, (req, res) => {
            const { message, sessionContext } = req.body;
            
            const enhancedRequest = {
                body: {
                    message,
                    context: {
                        ...sessionContext,
                        currentPage: 'learning',
                        sessionType: 'study'
                    }
                },
                user: req.user
            };
            
            AIController.enhancedChatbot(enhancedRequest, res);
        });
    
    // Get motivation and encouragement
    app.route('/api/ai/motivation')
        .get(authenticate, async (req, res) => {
            try {
                const motivationRequest = {
                    body: {
                        message: "I need some motivation to continue studying",
                        context: {
                            requestType: 'motivation',
                            currentPage: 'general'
                        }
                    },
                    user: req.user
                };
                
                await AIController.enhancedChatbot(motivationRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to provide motivation'
                });
            }
        });
    
    // Get break recommendations
    app.route('/api/ai/break/suggest')
        .post(authenticate, async (req, res) => {
            try {
                const { studyDuration, currentFocus } = req.body;
                
                const breakRequest = {
                    body: {
                        message: `I've been studying ${currentFocus} for ${studyDuration} minutes. Should I take a break?`,
                        context: {
                            requestType: 'break_suggestion',
                            studyDuration,
                            currentFocus
                        }
                    },
                    user: req.user
                };
                
                await AIController.enhancedChatbot(breakRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to suggest break timing'
                });
            }
        });
    
    // ===========================================
    // EXAM PREPARATION ROUTES
    // ===========================================
    
    // Get exam strategy
    app.route('/api/ai/exam/strategy/:examId')
        .get(authenticate, async (req, res) => {
            try {
                const { examId } = req.params;
                const { timeUntilExam, subject } = req.query;
                
                const strategyRequest = {
                    body: {
                        examId,
                        subject,
                        timeUntilExam,
                        currentPreparation: 'requesting strategy'
                    },
                    user: req.user
                };
                
                await AIController.prepareForExam(strategyRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to generate exam strategy'
                });
            }
        });
    
    // Get time management tips for exams
    app.route('/api/ai/exam/time-management')
        .post(authenticate, async (req, res) => {
            try {
                const { examDuration, questionCount, subjects } = req.body;
                
                const timeRequest = {
                    body: {
                        message: `Help me manage time for a ${examDuration}-minute exam with ${questionCount} questions covering ${subjects.join(', ')}`,
                        context: {
                            requestType: 'time_management',
                            examDuration,
                            questionCount,
                            subjects
                        }
                    },
                    user: req.user
                };
                
                await AIController.enhancedChatbot(timeRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to provide time management tips'
                });
            }
        });
    
    // ===========================================
    // ANALYTICS AND INSIGHTS
    // ===========================================
    
    // Get comprehensive learning analytics
    app.route('/api/ai/analytics/comprehensive')
        .get(authenticate, AIController.getLearningInsights);
    
    // Get performance predictions
    app.route('/api/ai/predict/performance')
        .post(authenticate, async (req, res) => {
            try {
                const { subject, timeframe, currentProgress } = req.body;
                
                const predictionRequest = {
                    query: {
                        timeframe: timeframe || 'week',
                        subjects: [subject]
                    },
                    user: req.user
                };
                
                await AIController.analyzeProgress(predictionRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to predict performance'
                });
            }
        });
    
    // ===========================================
    // SYSTEM INTEGRATION ROUTES
    // ===========================================
    
    // Get system capabilities and health
    app.route('/api/ai/system/capabilities')
        .get(authenticate, AIController.getSystemCapabilities);
    
    // Navigation assistance
    app.route('/api/ai/navigate')
        .post(authenticate, async (req, res) => {
            try {
                const { destination, currentPage } = req.body;
                
                const navRequest = {
                    body: {
                        message: `Take me to ${destination}`,
                        context: {
                            currentPage,
                            requestType: 'navigation'
                        }
                    },
                    user: req.user
                };
                
                await AIController.enhancedChatbot(navRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to provide navigation assistance'
                });
            }
        });
    
    // Feature discovery
    app.route('/api/ai/features/discover')
        .get(authenticate, async (req, res) => {
            try {
                const discoveryRequest = {
                    body: {
                        message: "What features are available on this platform?",
                        context: {
                            requestType: 'feature_discovery'
                        }
                    },
                    user: req.user
                };
                
                await AIController.enhancedChatbot(discoveryRequest, res);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to discover features'
                });
            }
        });
    
    // ===========================================
    // BACKWARD COMPATIBILITY ROUTES
    // ===========================================
    
    // Legacy chatbot endpoint (redirect to enhanced)
    app.route('/api/ai/chatbot')
        .post(authenticate, AIController.enhancedChatbot);
    
    // Legacy requests endpoints
    app.route('/api/ai/requests')
        .get(authenticate, AIController.getAllAIRequests)
        .post(authenticate, async (req, res) => {
            // Convert legacy request to new format
            const { request, response } = req.body;
            
            const legacyRequest = {
                body: {
                    message: request,
                    context: { legacy: true }
                },
                user: req.user
            };
            
            await AIController.enhancedChatbot(legacyRequest, res);
        });
        
    app.route('/api/ai/requests/user')
        .get(authenticate, AIController.getAIRequestsByUser);
    
    // ===========================================
    // ADMIN ROUTES
    // ===========================================
    
    // Admin AI system overview
    app.route('/api/admin/ai/overview')
        .get(authenticate, requireRole('admin'), async (req, res) => {
            try {
                const overview = {
                    totalInteractions: await AI.countDocuments(),
                    activeUsers: await AI.distinct('userId').countDocuments(),
                    systemHealth: 'operational',
                    capabilities: await AIController.getSystemCapabilities({ user: { id: 'admin' } }, { json: (data) => data }),
                    timestamp: new Date().toISOString()
                };
                
                res.json({
                    success: true,
                    overview
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to get AI system overview'
                });
            }
        });
    
    // Admin AI health check
    app.route('/api/admin/ai/health')
        .get(authenticate, requireRole('admin'), AIController.getSystemCapabilities);
        
    // Admin AI requests
    app.route('/api/admin/ai/requests')
        .get(authenticate, requireRole('admin'), AIController.getAllAIRequests);
    
    // Admin AI analytics
    app.route('/api/admin/ai/analytics')
        .get(authenticate, requireRole('admin'), async (req, res) => {
            try {
                const analytics = {
                    interactionsByDay: await getInteractionsByDay(),
                    popularQuestions: await getPopularQuestions(),
                    userEngagement: await getUserEngagement(),
                    systemPerformance: await getSystemPerformance()
                };
                
                res.json({
                    success: true,
                    analytics,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Unable to get AI analytics'
                });
            }
        });
};

// Helper functions for admin analytics
async function getInteractionsByDay() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        return await AI.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    } catch (error) {
        console.error('Error getting interactions by day:', error);
        return [];
    }
}

async function getPopularQuestions() {
    try {
        return await AI.aggregate([
            {
                $group: {
                    _id: "$request",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
    } catch (error) {
        console.error('Error getting popular questions:', error);
        return [];
    }
}

async function getUserEngagement() {
    try {
        const totalUsers = await AI.distinct('userId').length;
        const activeUsers = await AI.distinct('userId', {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).length;
        
        return {
            totalUsers,
            activeUsers,
            engagementRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : 0
        };
    } catch (error) {
        console.error('Error getting user engagement:', error);
        return { totalUsers: 0, activeUsers: 0, engagementRate: 0 };
    }
}

async function getSystemPerformance() {
    try {
        const avgResponseTime = await AI.aggregate([
            {
                $group: {
                    _id: null,
                    avgResponseLength: { $avg: { $strLenCP: "$response" } }
                }
            }
        ]);
        
        return {
            averageResponseLength: avgResponseTime[0]?.avgResponseLength || 0,
            systemStatus: 'operational',
            uptime: process.uptime()
        };
    } catch (error) {
        console.error('Error getting system performance:', error);
        return { averageResponseLength: 0, systemStatus: 'unknown', uptime: 0 };
    }
}

module.exports = EnhancedAIRouter;