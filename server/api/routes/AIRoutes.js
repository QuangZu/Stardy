const AIController = require('../controllers/AIController');
const { authenticate, requireRole } = require('../middlewares/auth');

const AIRouter = (app) => {
    // Existing AI request logging routes
    app.route('/api/ai/requests')
        .get(authenticate, AIController.getAllAIRequests)
        .post(authenticate, AIController.createAIRequest);
        
    app.route('/api/ai/requests/user')
        .get(authenticate, AIController.getAIRequestsByUser);
    
    // Chatbot endpoint - main chat interface
    app.route('/api/ai/chatbot')
        .post(authenticate, AIController.chatbot);
    
    // Personalized learning recommendations
    app.route('/api/ai/recommendations')
        .get(authenticate, AIController.getRecommendations);
    
    // Exam-specific recommendations for learning page
    app.route('/api/ai/recommendations/exam')
        .get(authenticate, AIController.getExamRecommendations);
    
    // Contextual help based on user state
    app.route('/api/ai/help')
        .get(authenticate, AIController.getContextualHelp);
    
    // User analytics for AI services
    app.route('/api/ai/analytics')
        .get(authenticate, AIController.getUserAnalytics);
    
    // Health check for AI services
    app.route('/api/ai/health')
        .get(authenticate, AIController.healthCheck);

    // Admin AI routes
    app.route('/api/admin/ai/health')
        .get(authenticate, requireRole('admin'), AIController.healthCheck);
        
    app.route('/api/admin/ai/requests')
        .get(authenticate, requireRole('admin'), AIController.getAllAIRequests);
};

module.exports = AIRouter;